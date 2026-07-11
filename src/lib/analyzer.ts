/**
 * Analysis Orchestrator
 *
 * Runs the three-phase analysis pipeline:
 *   Phase 1: Process each weekly chunk with the fast model → JSON summaries
 *   Phase 2: If too large, aggregate summaries by month with the fast model
 *   Phase 3: Feed aggregated summaries to the capable model → final report
 *
 * Emits progress callbacks at each step.
 * Supports cancellation via an AbortController-like signal.
 */

import type { ParseResult } from "./whatsapp-parser";
import { chunkChat, groupChunksByMonth, aggregateSummaries, batchChunks, type ChatChunk } from "./chunking";
import { LLMClient, LLMError, extractJSON, type ChatMessage } from "./llm-client";
import { buildChunkPrompt, buildBatchedChunkPrompt, buildMonthlyAggregationPrompt, buildFinalReportPrompt } from "./prompts";
import type { AnalysisReport } from "./report-types";

export interface ChunkSummary {
  week_start: string;
  week_end: string;
  dominant_topics: string[];
  emotional_tone: string;
  message_count_by_person: { A: number; B: number };
  avg_message_length: { A: number; B: number };
  initiation_ratio: { A: number; B: number };
  conflict_indicators: { present: boolean; description: string };
  vulnerability_moments: { present: boolean; description: string };
  humor_instances: string[];
  response_time_patterns: string;
  notable_quotes: { A: string; B: string };
  relationship_dynamics_observed: string;
}

export interface ProgressUpdate {
  phase: 1 | 2 | 3;
  phaseName: string;
  current: number;
  total: number;
  message: string;
  /** Estimated seconds remaining, based on rolling average of step durations */
  etaSeconds?: number;
}

export interface AnalysisResult {
  report: AnalysisReport;
  chunkSummaries: ChunkSummary[];
  chunks: ChatChunk[];
}

export class AnalysisCancelledError extends Error {
  constructor() {
    super("Analysis cancelled by user");
    this.name = "AnalysisCancelledError";
  }
}

export interface AnalyzerOptions {
  parseResult: ParseResult;
  client: LLMClient;
  onProgress: (update: ProgressUpdate) => void;
  isCancelled: () => boolean;
  /** Hook called when rate limit cooldown starts (seconds) */
  onCooldown?: (seconds: number, message: string) => void;
}

export async function runAnalysis(opts: AnalyzerOptions): Promise<AnalysisResult> {
  const { parseResult, client, onProgress, isCancelled } = opts;

  if (parseResult.participants.length < 2) {
    throw new Error("Could not detect two participants in this chat.");
  }

  const personA = parseResult.participants[0];
  const personB = parseResult.participants[1];

  // ─────────────────────────────────────────────────────────────
  // PHASE 1: Chunk processing (batched)
  // ─────────────────────────────────────────────────────────────
  // Multiple chunks are sent per API call to minimize total requests.
  // This is critical for providers with tight daily request limits
  // (e.g. Google Gemini 3.1 Flash Lite: 500 RPD) but generous token
  // limits (250k TPM). With batches of 5 chunks per call, a 250-chunk
  // chat (≈112k messages over a year) needs only ~50 Phase 1 requests
  // instead of 250.
  const chunks = chunkChat(parseResult);
  if (chunks.length === 0) {
    throw new Error("No chat messages found to analyze.");
  }

  // Build batches. Default: max 6 chunks OR 40k chars per batch.
  const batches = batchChunks(chunks);
  const chunkSummaries: ChunkSummary[] = new Array(chunks.length);
  const stepDurations: number[] = [];
  let processedChunks = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    if (isCancelled()) throw new AnalysisCancelledError();

    const batch = batches[batchIdx];
    const stepStart = Date.now();

    onProgress({
      phase: 1,
      phaseName: "Processing chat chunks",
      current: processedChunks + 1,
      total: chunks.length,
      message: `Analyzing batch ${batchIdx + 1} of ${batches.length} (${batch.length} weeks: ${batch[0].startDate.toLocaleDateString()} → ${batch[batch.length - 1].endDate.toLocaleDateString()})`,
      etaSeconds: estimateEta(stepDurations, batches.length - batchIdx),
    });

    const summariesForBatch = await processBatch(batch, personA, personB, client, opts, isCancelled);
    // Place summaries back into the global array at their original chunk indexes
    for (let i = 0; i < batch.length; i++) {
      const chunk = batch[i];
      const originalIdx = chunk.index;
      chunkSummaries[originalIdx] = summariesForBatch[i];
    }
    processedChunks += batch.length;
    stepDurations.push(Date.now() - stepStart);
  }

  // Fill any gaps with fallback summaries (shouldn't normally happen)
  for (let i = 0; i < chunkSummaries.length; i++) {
    if (!chunkSummaries[i]) {
      chunkSummaries[i] = fallbackChunkSummary(chunks[i]);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 2: Aggregation (monthly if needed)
  // ─────────────────────────────────────────────────────────────
  if (isCancelled()) throw new AnalysisCancelledError();

  const summaryStrings = chunkSummaries.map((s) => JSON.stringify(s));
  const { aggregated, needsMonthlyAggregation: autoNeedsAgg } = aggregateSummaries(summaryStrings);

  // Also force monthly aggregation if there are many chunks, even if total chars
  // are under the limit. This keeps Phase 3 input compact for any provider.
  const forceAggregation = chunks.length >= 6;
  let finalAggregated = aggregated;
  let monthlySummaries: string[] | null = null;

  if (autoNeedsAgg || forceAggregation) {
    onProgress({
      phase: 2,
      phaseName: "Aggregating summaries by month",
      current: 0,
      total: 1,
      message: "Compressing weekly summaries into monthly digests...",
    });

    const monthGroups = groupChunksByMonth(chunks);
    const monthSummaries: string[] = [];
    monthlySummaries = monthSummaries;

    for (let i = 0; i < monthGroups.length; i++) {
      if (isCancelled()) throw new AnalysisCancelledError();
      const group = monthGroups[i];
      const monthLabel = group[0].startDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      onProgress({
        phase: 2,
        phaseName: "Aggregating summaries by month",
        current: i + 1,
        total: monthGroups.length,
        message: `Summarizing ${monthLabel}...`,
      });

      // Get the weekly summaries for this month's chunks
      const chunkIndexes = new Set(group.map((c) => c.index));
      const weeklySummariesForMonth = chunkSummaries
        .filter((_, idx) => chunkIndexes.has(idx))
        .map((s) => JSON.stringify(s));

      const prompt = buildMonthlyAggregationPrompt(monthLabel, weeklySummariesForMonth);
      try {
        const response = await client.fast(
          [
            {
              role: "system",
              content:
                "You are a careful aggregator. You output ONLY valid JSON, no markdown, no commentary.",
            },
            { role: "user", content: prompt },
          ],
          { temperature: 0.3, maxTokens: 1500 }
        );
        monthSummaries.push(response.content);
      } catch (err) {
        // Fallback: just concatenate the weekly summaries
        console.warn(`Monthly aggregation failed for ${monthLabel}:`, err);
        monthSummaries.push(weeklySummariesForMonth.join("\n\n"));
      }
    }

    finalAggregated = monthSummaries.join("\n\n===\n\n");
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 3: Final comprehensive report
  // ─────────────────────────────────────────────────────────────
  if (isCancelled()) throw new AnalysisCancelledError();

  onProgress({
    phase: 3,
    phaseName: "Generating comprehensive report",
    current: 0,
    total: 1,
    message: "Synthesizing all data into your comprehensive friendship report...",
  });

  const dateRange = parseResult.dateRange;
  const timeframe = dateRange
    ? `${dateRange.start.toLocaleDateString("en-US", { month: "short", year: "numeric" })} to ${dateRange.end.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
    : "the analyzed period";

  let workingAggregated = finalAggregated;
  let report: AnalysisReport | null = null;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (isCancelled()) throw new AnalysisCancelledError();
    try {
      const finalPrompt = buildFinalReportPrompt(
        personA,
        personB,
        timeframe,
        workingAggregated,
        parseResult.messages.length
      );
      let response = await client.capable(
        [
          {
            role: "system",
            content:
              "You are an insightful, witty, and respectful friendship analyst. You output ONLY valid JSON, never markdown fences, never commentary outside the JSON. All string values must be valid JSON strings (properly escaped).",
          },
          { role: "user", content: finalPrompt },
        ],
        { temperature: 0.7, maxTokens: 12000 }
      );

      // CONTINUATION: If the model hit the token limit (finish_reason = "length"),
      // the JSON is likely truncated. Send continuation requests to get the rest.
      let fullContent = response.content;
      let continuationCount = 0;
      while (response.finishReason === "length" && continuationCount < 3) {
        if (isCancelled()) throw new AnalysisCancelledError();
        continuationCount++;
        console.log(`Response truncated (finish_reason=length), requesting continuation ${continuationCount}...`);
        onProgress({
          phase: 3,
          phaseName: "Generating comprehensive report",
          current: 0,
          total: 1,
          message: `Report is large — continuing generation (part ${continuationCount + 1})...`,
        });
        response = await client.capable(
          [
            {
              role: "system",
              content:
                "You are an insightful, witty, and respectful friendship analyst. You output ONLY valid JSON, never markdown fences, never commentary outside the JSON. All string values must be valid JSON strings (properly escaped).",
            },
            { role: "user", content: finalPrompt },
            { role: "assistant", content: fullContent },
            {
              role: "user",
              content:
                "Your previous response was cut off due to length limits. Continue EXACTLY where you left off — do not repeat any previous content, do not add any explanation, just output the remaining JSON to complete the object. Start mid-stream if necessary (e.g. if cut off in the middle of a string, continue that string).",
            },
          ],
          { temperature: 0.7, maxTokens: 12000 }
        );
        fullContent += response.content;
      }

      report = extractJSON<AnalysisReport>(fullContent);
      break;
    } catch (err) {
      lastError = err as Error;
      if (err instanceof LLMError) {
        if (err.type === "rate_limited") {
          const wait = Math.min((err.retryAfter ?? 5000) / 1000, 60);
          opts.onCooldown?.(wait, "Rate limit on capable model. Cooling down...");
          continue;
        }
        if (err.type === "invalid_api_key") throw err;
        if (err.type === "model_unavailable") throw err;
        if (err.type === "context_too_long") {
          // Try halving the aggregated input
          if (attempt < 2) {
            workingAggregated = workingAggregated.slice(0, Math.floor(workingAggregated.length / 2));
            continue;
          }
        }
        // For unknown errors, include the raw API body so the user sees the real message
        if (err.type === "unknown" && err.rawBody) {
          throw new Error(`${err.message}\n\nAPI response: ${err.rawBody.slice(0, 500)}`);
        }
      }
      // Retry once for other errors
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
    }
  }

  if (!report) {
    // Build a detailed error message including the underlying API error
    let errMsg = "Failed to generate final report after multiple attempts.";
    if (lastError instanceof LLMError) {
      errMsg = `${errMsg}\n\nLast error: ${lastError.message}`;
      if (lastError.rawBody) {
        errMsg += `\n\nRaw API response: ${lastError.rawBody.slice(0, 800)}`;
      }
    } else if (lastError) {
      errMsg = `${errMsg}\n\nLast error: ${lastError.message}`;
    }
    throw new Error(errMsg);
  }

  onProgress({
    phase: 3,
    phaseName: "Generating comprehensive report",
    current: 1,
    total: 1,
    message: "Report complete!",
  });

  return {
    report,
    chunkSummaries,
    chunks,
  };
}

/**
 * Process a batch of chunks in a single API call.
 *
 * Strategy:
 *   1. Try the batched prompt (multiple chunks → JSON array of summaries)
 *   2. If the model returns wrong number of summaries, or context too long,
 *      fall back to processing chunks individually
 *   3. If a single chunk still fails, return a fallback summary for it
 *
 * This is robust to:
 *   - Models that struggle with batched JSON output
 *   - Batches that turn out too large for the model's context window
 *   - Individual chunk failures (doesn't lose the whole batch)
 */
async function processBatch(
  batch: ChatChunk[],
  personA: string,
  personB: string,
  client: LLMClient,
  opts: AnalyzerOptions,
  isCancelled: () => boolean
): Promise<ChunkSummary[]> {
  // Single chunk — use simple prompt (more reliable than batched)
  if (batch.length === 1) {
    const summary = await processSingleChunk(batch[0], client, opts, isCancelled);
    return [summary];
  }

  // Multiple chunks — try batched prompt first
  for (let attempt = 0; attempt < 2; attempt++) {
    if (isCancelled()) throw new AnalysisCancelledError();
    try {
      const prompt = buildBatchedChunkPrompt(batch, personA, personB);
      const response = await client.fast(
        [
          {
            role: "system",
            content:
              "You are a careful, neutral chat analyst. You output ONLY a valid JSON array, never markdown fences, never commentary outside the array.",
          },
          { role: "user", content: prompt },
        ],
        { temperature: 0.4, maxTokens: Math.min(4000, 800 * batch.length) }
      );
      const summaries = extractJSON<ChunkSummary[]>(response.content);
      if (Array.isArray(summaries) && summaries.length === batch.length) {
        return summaries;
      }
      // Wrong count — try to salvage: if we got at least some valid summaries,
      // use them and fall back for the rest
      if (Array.isArray(summaries) && summaries.length > 0) {
        const result: ChunkSummary[] = [];
        for (let i = 0; i < batch.length; i++) {
          if (i < summaries.length && summaries[i]) {
            result.push(summaries[i]);
          } else {
            result.push(await processSingleChunk(batch[i], client, opts, isCancelled));
          }
        }
        return result;
      }
      // Not an array — retry
    } catch (err) {
      if (err instanceof LLMError) {
        if (err.type === "rate_limited") {
          const wait = Math.min((err.retryAfter ?? 5000) / 1000, 60);
          opts.onCooldown?.(wait, "Rate limit reached. Cooling down...");
          continue;
        }
        if (err.type === "invalid_api_key") throw err;
        if (err.type === "model_unavailable") throw err;
        if (err.type === "context_too_long") {
          // Batch too big — fall back to individual chunks
          break;
        }
      }
      // Other errors — retry once
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
    }
  }

  // Fallback: process each chunk individually
  const result: ChunkSummary[] = [];
  for (const chunk of batch) {
    if (isCancelled()) throw new AnalysisCancelledError();
    result.push(await processSingleChunk(chunk, client, opts, isCancelled));
  }
  return result;
}

/**
 * Process a single chunk — used as fallback when batched processing fails
 * or when a batch contains only one chunk.
 */
async function processSingleChunk(
  chunk: ChatChunk,
  client: LLMClient,
  opts: AnalyzerOptions,
  isCancelled: () => boolean
): Promise<ChunkSummary> {
  const prompt = buildChunkPrompt(chunk);
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a careful, neutral chat analyst. You output ONLY valid JSON, never markdown fences, never commentary.",
    },
    { role: "user", content: prompt },
  ];

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (isCancelled()) throw new AnalysisCancelledError();
    try {
      const response = await client.fast(messages, {
        temperature: 0.4,
        maxTokens: 1200,
      });
      return extractJSON<ChunkSummary>(response.content);
    } catch (err) {
      lastError = err as Error;
      if (err instanceof LLMError) {
        if (err.type === "rate_limited") {
          const wait = Math.min((err.retryAfter ?? 5000) / 1000, 60);
          opts.onCooldown?.(wait, "Rate limit reached. Cooling down...");
          continue;
        }
        if (err.type === "invalid_api_key") throw err;
        if (err.type === "model_unavailable") throw err;
        if (err.type === "context_too_long") {
          // Chunk is too big — split it in half, process each half, merge
          if (attempt === 0 && chunk.messages.length > 4) {
            try {
              return await splitAndProcessChunk(chunk, client, isCancelled);
            } catch (mergeErr) {
              lastError = mergeErr as Error;
            }
          } else {
            break;
          }
        }
      }
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  console.warn(`Failed chunk ${chunk.index + 1}:`, lastError?.message);
  return fallbackChunkSummary(chunk);
}

/**
 * Split an over-sized chunk in half, process each half separately,
 * then merge results.
 */
async function splitAndProcessChunk(
  chunk: ChatChunk,
  client: LLMClient,
  isCancelled: () => boolean
): Promise<ChunkSummary> {
  if (isCancelled()) throw new AnalysisCancelledError();
  const mid = Math.floor(chunk.messages.length / 2);
  const half1 = { ...chunk, messages: chunk.messages.slice(0, mid) };
  const half2 = { ...chunk, messages: chunk.messages.slice(mid) };
  half1.formattedText = half1.messages
    .map((m) => `[${m.date.toLocaleDateString()} ${m.date.toLocaleTimeString()}] ${m.sender}: ${m.content.slice(0, 1500)}`)
    .join("\n");
  half2.formattedText = half2.messages
    .map((m) => `[${m.date.toLocaleDateString()} ${m.date.toLocaleTimeString()}] ${m.sender}: ${m.content.slice(0, 1500)}`)
    .join("\n");

  const r1 = await client.fast(
    [
      { role: "system", content: "You are a careful chat analyst. Output ONLY valid JSON." },
      { role: "user", content: buildChunkPrompt(half1) },
    ],
    { temperature: 0.4, maxTokens: 1000 }
  );
  const r2 = await client.fast(
    [
      { role: "system", content: "You are a careful chat analyst. Output ONLY valid JSON." },
      { role: "user", content: buildChunkPrompt(half2) },
    ],
    { temperature: 0.4, maxTokens: 1000 }
  );
  const s1 = extractJSON<ChunkSummary>(r1.content);
  const s2 = extractJSON<ChunkSummary>(r2.content);
  return {
    ...s1,
    week_start: chunk.startDate.toISOString().slice(0, 10),
    week_end: chunk.endDate.toISOString().slice(0, 10),
    message_count_by_person: {
      A: (s1.message_count_by_person.A ?? 0) + (s2.message_count_by_person.A ?? 0),
      B: (s1.message_count_by_person.B ?? 0) + (s2.message_count_by_person.B ?? 0),
    },
    dominant_topics: [...new Set([...(s1.dominant_topics ?? []), ...(s2.dominant_topics ?? [])])].slice(0, 8),
    humor_instances: [...new Set([...(s1.humor_instances ?? []), ...(s2.humor_instances ?? [])])].slice(0, 6),
    conflict_indicators: {
      present: s1.conflict_indicators?.present || s2.conflict_indicators?.present || false,
      description: [s1.conflict_indicators?.description, s2.conflict_indicators?.description].filter(Boolean).join(" | ") || "",
    },
    vulnerability_moments: {
      present: s1.vulnerability_moments?.present || s2.vulnerability_moments?.present || false,
      description: [s1.vulnerability_moments?.description, s2.vulnerability_moments?.description].filter(Boolean).join(" | ") || "",
    },
    relationship_dynamics_observed: [s1.relationship_dynamics_observed, s2.relationship_dynamics_observed].filter(Boolean).join(" | "),
  };
}

function estimateEta(durations: number[], remaining: number): number {
  if (durations.length === 0) return 0;
  const avg =
    durations.reduce((sum, d) => sum + d, 0) / durations.length;
  return Math.round((avg * remaining) / 1000);
}

function fallbackChunkSummary(chunk: ChatChunk): ChunkSummary {
  const aMessages = chunk.messages.filter((m) => m.sender === chunk.personA);
  const bMessages = chunk.messages.filter((m) => m.sender === chunk.personB);
  return {
    week_start: chunk.startDate.toISOString().slice(0, 10),
    week_end: chunk.endDate.toISOString().slice(0, 10),
    dominant_topics: [],
    emotional_tone: "neutral",
    message_count_by_person: {
      A: aMessages.length,
      B: bMessages.length,
    },
    avg_message_length: {
      A: aMessages.length
        ? Math.round(
            aMessages.reduce((s, m) => s + m.content.length, 0) /
              aMessages.length
          )
        : 0,
      B: bMessages.length
        ? Math.round(
            bMessages.reduce((s, m) => s + m.content.length, 0) /
              bMessages.length
          )
        : 0,
    },
    initiation_ratio: { A: 50, B: 50 },
    conflict_indicators: { present: false, description: "" },
    vulnerability_moments: { present: false, description: "" },
    humor_instances: [],
    response_time_patterns: "mixed",
    notable_quotes: { A: "", B: "" },
    relationship_dynamics_observed: "Summary unavailable for this week.",
  };
}
