/**
 * Prompt templates for the three-phase analysis pipeline.
 *
 * Phase 1: Weekly chunk analysis (small/fast model)
 * Phase 2: Monthly aggregation (only if Phase 1 output is too large)
 * Phase 3: Final comprehensive report (most capable model)
 */

import type { ChatChunk } from "./chunking";

/**
 * Phase 1: Build the prompt for analyzing a single weekly chunk.
 * Asks the model to return strict JSON.
 */
export function buildChunkPrompt(chunk: ChatChunk): string {
  const dateRange = `${chunk.startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} to ${chunk.endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return `Analyze this WhatsApp chat chunk between Person A (${chunk.personA}) and Person B (${chunk.personB}) for the week of ${dateRange}.

Extract and summarize in JSON format ONLY (no markdown, no code fences, just raw JSON). Use this exact schema:

{
  "week_start": "${chunk.startDate.toISOString().slice(0, 10)}",
  "week_end": "${chunk.endDate.toISOString().slice(0, 10)}",
  "dominant_topics": ["topic1", "topic2", ...],
  "emotional_tone": "positive|negative|neutral|mixed",
  "message_count_by_person": {
    "A": <number>,
    "B": <number>
  },
  "avg_message_length": {
    "A": <number in characters>,
    "B": <number in characters>
  },
  "initiation_ratio": {
    "A": <percentage 0-100>,
    "B": <percentage 0-100>
  },
  "conflict_indicators": {
    "present": <true|false>,
    "description": "<brief description or empty>"
  },
  "vulnerability_moments": {
    "present": <true|false>,
    "description": "<brief description or empty>"
  },
  "humor_instances": ["type1", "type2", ...],
  "response_time_patterns": "fast|slow|mixed",
  "notable_quotes": {
    "A": "<1-2 most representative messages from A, or empty>",
    "B": "<1-2 most representative messages from B, or empty>"
  },
  "relationship_dynamics_observed": "<brief description of how they interacted this week>"
}

Rules:
- Person A is ${chunk.personA}. Person B is ${chunk.personB}.
- Be concise but specific. Reference actual topics and behaviors seen.
- If a field is genuinely empty for this week, use empty string or empty array.
- Do NOT include any text outside the JSON object.
- Initiation_ratio percentages should sum to ~100.

Chat content:

${chunk.formattedText}`;
}

/**
 * Phase 1 (batched): Build a prompt that analyzes MULTIPLE weekly chunks
 * in a single API call. The model returns a JSON array of summaries,
 * one per chunk.
 *
 * This is critical for providers like Google Gemini 3.1 Flash Lite that
 * have a tight daily request limit (500 RPD) but a generous token-per-minute
 * limit (250k TPM). By batching ~5 chunks per call, we cut total requests
 * by ~5x — making large chats (100k+ messages) feasible on the free tier.
 */
export function buildBatchedChunkPrompt(
  chunks: ChatChunk[],
  personA: string,
  personB: string
): string {
  const chunkDescriptions = chunks
    .map((chunk, idx) => {
      const dateRange = `${chunk.startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} to ${chunk.endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
      return `=== CHUNK ${idx + 1} of ${chunks.length} ===
Week: ${dateRange}
Message count: ${chunk.messages.length}

${chunk.formattedText}`;
    })
    .join("\n\n");

  return `Analyze ${chunks.length} WhatsApp chat chunks between Person A (${personA}) and Person B (${personB}).

For EACH chunk, extract a summary using this exact JSON schema. Return a JSON ARRAY with ${chunks.length} elements (one per chunk, in order):

[
  {
    "week_start": "<YYYY-MM-DD>",
    "week_end": "<YYYY-MM-DD>",
    "dominant_topics": ["topic1", "topic2"],
    "emotional_tone": "positive|negative|neutral|mixed",
    "message_count_by_person": { "A": <number>, "B": <number> },
    "avg_message_length": { "A": <number>, "B": <number> },
    "initiation_ratio": { "A": <percentage 0-100>, "B": <percentage 0-100> },
    "conflict_indicators": { "present": <true|false>, "description": "<brief or empty>" },
    "vulnerability_moments": { "present": <true|false>, "description": "<brief or empty>" },
    "humor_instances": ["type1", "type2"],
    "response_time_patterns": "fast|slow|mixed",
    "notable_quotes": { "A": "<1-2 quotes or empty>", "B": "<1-2 quotes or empty>" },
    "relationship_dynamics_observed": "<brief description>"
  },
  ...
]

Rules:
- Person A is ${personA}. Person B is ${personB}.
- Return EXACTLY ${chunks.length} array elements, in the same order as the chunks below.
- Each element's week_start/week_end must match the chunk's date range.
- Be concise but specific. Reference actual topics and behaviors seen.
- Do NOT include any text outside the JSON array.
- Initiation_ratio percentages should sum to ~100 per chunk.

Chat chunks:

${chunkDescriptions}`;
}

/**
 * Phase 2: Monthly aggregation prompt.
 * Takes 4-5 weekly summaries and produces a single monthly summary.
 */
export function buildMonthlyAggregationPrompt(
  monthLabel: string,
  weeklySummaries: string[]
): string {
  return `You are aggregating weekly WhatsApp chat summaries into a monthly summary.

Below are ${weeklySummaries.length} weekly summaries for the month of ${monthLabel}. Combine them into a single monthly summary in JSON format (raw JSON, no markdown fences), using this schema:

{
  "month": "${monthLabel}",
  "dominant_topics": ["combined list of main topics for the month"],
  "emotional_tone": "positive|negative|neutral|mixed",
  "message_count_by_person": {
    "A": <sum across weeks>,
    "B": <sum across weeks>
  },
  "avg_message_length": {
    "A": <average>,
    "B": <average>
  },
  "initiation_ratio": {
    "A": <percentage>,
    "B": <percentage>
  },
  "conflict_indicators": {
    "present": <true|false>,
    "description": "<summary of any conflicts this month>"
  },
  "vulnerability_moments": {
    "present": <true|false>,
    "description": "<summary of vulnerable moments>"
  },
  "humor_instances": ["combined list of humor types"],
  "response_time_patterns": "fast|slow|mixed",
  "notable_quotes": {
    "A": "<1-2 best quotes from A this month>",
    "B": "<1-2 best quotes from B this month>"
  },
  "relationship_dynamics_observed": "<summary of how the relationship evolved this month>"
}

Weekly summaries (each is a JSON object):

${weeklySummaries.join("\n\n---\n\n")}

Return ONLY the JSON object, no other text.`;
}

/**
 * Phase 3: Final report prompt.
 * Sends all aggregated summaries + asks for the comprehensive 12-section report.
 */
export function buildFinalReportPrompt(
  personA: string,
  personB: string,
  timeframe: string,
  aggregatedSummaries: string,
  totalMessageCount: number
): string {
  return `You are an insightful friendship analyst. Generate a comprehensive friendship analysis report based on the following aggregated chat summaries between Person A (${personA}) and Person B (${personB}) over approximately ${timeframe} (${totalMessageCount} total messages analyzed).

Write in an engaging, insightful, occasionally humorous but always respectful tone. Be specific—reference actual patterns, topics, and behaviors observed in the summaries. Avoid generic platitudes. When you identify a pattern, give evidence by quoting from the summaries.

# OUTPUT FORMAT

Return a single JSON object (raw JSON, no markdown fences, no comments). The JSON MUST follow this exact schema. Use empty strings or empty arrays only when truly no data exists. Do not add fields not in the schema.

{
  "executive_summary": {
    "health_score": <integer 1-10>,
    "health_justification": "<2-4 sentences>",
    "archetypes": [
      {"name": "Adventure buddies", "score": <1-10>},
      {"name": "Emotional support system", "score": <1-10>},
      {"name": "Intellectual sparring partners", "score": <1-10>},
      {"name": "Activity-based friends", "score": <1-10>},
      {"name": "Long-distance maintenance friends", "score": <1-10>},
      {"name": "Chaos partners", "score": <1-10>},
      {"name": "Low-maintenance friends", "score": <1-10>},
      {"name": "High-maintenance but worth it friends", "score": <1-10>},
      {"name": "Growth-oriented friends", "score": <1-10>},
      {"name": "Comfort zone friends", "score": <1-10>}
    ],
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "growth_areas": ["<area 1>", "<area 2>", "<area 3>"],
    "surprising_finding": "<1-3 sentences>",
    "essence_sentence": "<single sentence>"
  },
  "personality_profiles": {
    "A": ${personalityProfileSchema("A", personA)},
    "B": ${personalityProfileSchema("B", personB)}
  },
  "relationship_dynamics": {
    "power_dynamics": {
      "conversational_power": "<who gets longer responses / sets topics / is deferred to - 2-4 sentences>",
      "decision_making_lead": "<who leads decisions like meetups/activities>",
      "imbalance_present": <true|false>,
      "imbalance_description": "<description or 'No significant imbalance'>",
      "subject_changer": "<who usually changes the subject>",
      "influence_lead": "<who has more influence when suggesting things>"
    },
    "interdependence": {
      "need_vs_want": "<description>",
      "emotional_reliance": "<can they go days without talking? regular contact needed?>",
      "information_exclusivity": "<do they tell each other things they don't tell others?>",
      "life_without_friendship": "<how would each person's life be different>",
      "style": "enmeshed|balanced|distant"
    },
    "reciprocity": [
      {"behavior": "Conversation initiation", "person_a": "<value>", "person_b": "<value>", "balanced": <true|false>},
      {"behavior": "Average response length", "person_a": "<value>", "person_b": "<value>", "balanced": <true|false>},
      {"behavior": "Questions asked", "person_a": "<value>", "person_b": "<value>", "balanced": <true|false>},
      {"behavior": "Support given", "person_a": "<value>", "person_b": "<value>", "balanced": <true|false>},
      {"behavior": "Vulnerability shared", "person_a": "<value>", "person_b": "<value>", "balanced": <true|false>},
      {"behavior": "Planning effort", "person_a": "<value>", "person_b": "<value>", "balanced": <true|false>}
    ],
    "reciprocity_note": "<1-3 sentences on whether imbalances feel natural/accepted or potentially resentful>",
    "glue_factors": [
      {"factor": "Shared history/nostalgia", "strength": <1-10>},
      {"factor": "Shared interests/activities", "strength": <1-10>},
      {"factor": "Emotional support function", "strength": <1-10>},
      {"factor": "Entertainment value", "strength": <1-10>},
      {"factor": "Intellectual stimulation", "strength": <1-10>},
      {"factor": "Convenience/proximity", "strength": <1-10>},
      {"factor": "Genuine deep connection", "strength": <1-10>}
    ],
    "glue_summary": "<2-4 sentences on what specifically holds this friendship together>"
  },
  "communication_patterns": {
    "flow_types": ["<which of: ping-pong, marathon, burst, background, performance, parallel>"],
    "flow_description": "<3-5 sentences on how they switch between types>",
    "conflict_style": {
      "person_a_style": "<direct/indirect/deflection/sarcasm/withdrawal/humor>",
      "person_b_style": "<direct/indirect/deflection/sarcasm/withdrawal/humor>",
      "apologizer_first": "<A|B|neither|both>",
      "apology_genuineness": "<observation>",
      "conflict_resolution": "resolved|fades|mixed",
      "recurring_topics": ["<topic 1>", "<topic 2>"],
      "frequency": "rare|occasional|frequent",
      "healthiness": "healthy|unhealthy|mixed",
      "description": "<3-5 sentences>"
    },
    "silence_analysis": {
      "silence_meaning": "<what silence means for this friendship>",
      "comfortable_or_anxious": "comfortable|anxious|mixed",
      "check_in_time": "<how long before someone checks in>",
      "left_on_read": "<is this a thing? how is it handled?>"
    },
    "digital_body_language": {
      "ok_meanings": "<what 'ok' vs 'ok!' vs 'okay' means for each person>",
      "punctuation_patterns": "<periods, exclamation marks, question marks usage>",
      "capitalization_patterns": "<ALL CAPS, lowercase, mixed>",
      "length_as_interest": "<does shorter = less interested for them?>"
    }
  },
  "topic_ecosystem": {
    "distribution": [
      {"topic": "Life updates", "percentage": <0-100>},
      {"topic": "Media/Entertainment", "percentage": <0-100>},
      {"topic": "Relationships & Dating", "percentage": <0-100>},
      {"topic": "Future plans & Aspirations", "percentage": <0-100>},
      {"topic": "Problems, Venting & Advice", "percentage": <0-100>},
      {"topic": "Intellectual/Philosophical", "percentage": <0-100>},
      {"topic": "Nostalgia & Memories", "percentage": <0-100>},
      {"topic": "Logistics & Planning", "percentage": <0-100>},
      {"topic": "Pure Nonsense & Memes", "percentage": <0-100>},
      {"topic": "Deep Personal Talks", "percentage": <0-100>}
    ],
    "distribution_note": "<2-3 sentences comparing to typical friendship distributions>",
    "depth": [
      {"topic": "<topic 1>", "level": "surface|moderate|deep|avoided"},
      {"topic": "<topic 2>", "level": "surface|moderate|deep|avoided"}
    ],
    "avoided_topics": ["<topic 1>", "<topic 2>"],
    "avoided_topics_note": "<2-3 sentences on why these might be avoided>",
    "niche_interests": ["<interest 1>", "<interest 2>"],
    "niche_interests_note": "<2-3 sentences on how they bond over these>"
  },
  "emotional_landscape": {
    "valence_ratio": "<positive:negative ratio, e.g. '7:3'>",
    "valence_shift": "<has this shifted over time? description>",
    "positive_triggers": ["<trigger 1>", "<trigger 2>"],
    "negative_triggers": ["<trigger 1>", "<trigger 2>"],
    "baseline": "<description of emotional baseline>",
    "contagion": {
      "a_down_b_response": "match|lift|space|frustrate|humor",
      "b_down_a_response": "match|lift|space|frustrate|humor",
      "a_effectiveness": "<how effective is A at improving B's mood>",
      "b_effectiveness": "<how effective is B at improving A's mood>"
    },
    "vulnerability_matrix": [
      {"topic": "Mental health", "person_a_comfort": "Low|Med|High", "person_b_comfort": "Low|Med|High", "shared_level": "None|One-way|Mutual"},
      {"topic": "Relationships", "person_a_comfort": "Low|Med|High", "person_b_comfort": "Low|Med|High", "shared_level": "None|One-way|Mutual"},
      {"topic": "Family issues", "person_a_comfort": "Low|Med|High", "person_b_comfort": "Low|Med|High", "shared_level": "None|One-way|Mutual"},
      {"topic": "Career anxiety", "person_a_comfort": "Low|Med|High", "person_b_comfort": "Low|Med|High", "shared_level": "None|One-way|Mutual"},
      {"topic": "Self-esteem", "person_a_comfort": "Low|Med|High", "person_b_comfort": "Low|Med|High", "shared_level": "None|One-way|Mutual"},
      {"topic": "Fears/insecurities", "person_a_comfort": "Low|Med|High", "person_b_comfort": "Low|Med|High", "shared_level": "None|One-way|Mutual"},
      {"topic": "Past trauma", "person_a_comfort": "Low|Med|High", "person_b_comfort": "Low|Med|High", "shared_level": "None|One-way|Mutual"},
      {"topic": "Financial stress", "person_a_comfort": "Low|Med|High", "person_b_comfort": "Low|Med|High", "shared_level": "None|One-way|Mutual"}
    ],
    "emotional_intelligence": {
      "A": {
        "detect_upset": <1-10>,
        "respond_appropriately": <1-10>,
        "advice_vs_listen": <1-10>,
        "respect_boundaries": <1-10>,
        "validate_feelings": <1-10>
      },
      "B": {
        "detect_upset": <1-10>,
        "respond_appropriately": <1-10>,
        "advice_vs_listen": <1-10>,
        "respect_boundaries": <1-10>,
        "validate_feelings": <1-10>
      }
    }
  },
  "humor_analysis": {
    "A": {
      "self_deprecating": <1-10>,
      "sarcasm_irony": <1-10>,
      "dark_humor": <1-10>,
      "wordplay_puns": <1-10>,
      "observational": <1-10>,
      "absurd_random": <1-10>,
      "reference_humor": <1-10>,
      "roasting_banter": <1-10>
    },
    "B": {
      "self_deprecating": <1-10>,
      "sarcasm_irony": <1-10>,
      "dark_humor": <1-10>,
      "wordplay_puns": <1-10>,
      "observational": <1-10>,
      "absurd_random": <1-10>,
      "reference_humor": <1-10>,
      "roasting_banter": <1-10>
    },
    "dark_humor_boundaries": "<3-4 sentences on dark humor usage and limits>",
    "inside_jokes": {
      "estimated_count": "<rough number or 'many'|'few'>",
      "longevity": "<how long they last>",
      "classic_callbacks": ["<callback 1>", "<callback 2>"],
      "outsider_lost": <true|false>
    },
    "compatibility": {
      "shared_funny": "<do they find the same things funny>",
      "engagement": "<when one jokes, does the other engage>",
      "bonding_mechanism": "major|secondary",
      "mismatches": "<any humor style mismatches causing friction>"
    }
  },
  "health_assessment": {
    "green_flags": ["<flag 1 with evidence>", "<flag 2 with evidence>", "..."],
    "yellow_flags": ["<flag 1 with concern>", "<flag 2 with concern>", "..."],
    "red_flags": ["<flag 1 if any>", "..."],
    "overall_score": <1-10>,
    "primary_strength": "<description>",
    "primary_risk": "<description>",
    "comparison_to_average": "above|average|below",
    "assessment": "<3-5 sentences>"
  },
  "temporal_patterns": {
    "daily_rhythm": {
      "peak_hours_A": "<e.g. '10am-12pm and 8pm-11pm'>",
      "peak_hours_B": "<e.g. '9am-11am and 7pm-10pm'>",
      "sync": "synced|asynchronous",
      "morning_vs_night": "<who is morning person vs night owl>",
      "effect_on_connection": "<2-3 sentences>"
    },
    "weekly_rhythm": {
      "busier_days": "<which days>",
      "end_of_week_pattern": "<description>",
      "beginning_of_week_pattern": "<description>"
    },
    "seasonal_patterns": "<3-4 sentences on seasonal changes, annual events, holidays>",
    "evolution": {
      "month_1": "<description>",
      "month_6": "<description>",
      "month_12": "<description>",
      "trajectory": "closer|maintaining|drifting",
      "shifts": "<description of noticeable shifts>"
    }
  },
  "comparative_analysis": {
    "similarity": {
      "communication_overlap": <0-100>,
      "interest_overlap": <0-100>,
      "personality_overlap": <0-100>,
      "value_alignment": <0-100>,
      "overall": "High|Medium|Low"
    },
    "complementarity": [
      "<when A is X, B provides Y - example 1>",
      "<when A is X, B provides Y - example 2>"
    ],
    "friction_points": [
      "<friction 1>",
      "<friction 2>"
    ],
    "puzzle_factor": "<3-4 sentences: do they fit like puzzle pieces or overlap as circles>"
  },
  "predictive_insights": {
    "trajectory_6_12_months": {
      "prediction": "closer|maintain|drift",
      "challenge_areas": ["<area 1>", "<area 2>"],
      "positive_developments": ["<dev 1>", "<dev 2>"],
      "confidence": "high|medium|low"
    },
    "scenarios": [
      {"scenario": "One gets into a serious relationship", "response": "<2-3 sentences>"},
      {"scenario": "One moves to a different city", "response": "<2-3 sentences>"},
      {"scenario": "Major values disagreement", "response": "<2-3 sentences>"},
      {"scenario": "Mental health crisis", "response": "<2-3 sentences>"},
      {"scenario": "Major success", "response": "<2-3 sentences>"},
      {"scenario": "Failure/loss", "response": "<2-3 sentences>"},
      {"scenario": "3+ months no contact", "response": "<2-3 sentences>"}
    ],
    "long_term_viability": {
      "type": "forever|season",
      "forever_change": "<what would need to change for forever>",
      "end_change": "<what would need to change for it to end>"
    }
  },
  "recommendations": {
    "person_a": {
      "keep_doing": ["<thing 1>", "<thing 2>", "<thing 3>"],
      "improve": ["<thing 1>", "<thing 2>"],
      "experiment": "<specific, actionable experiment>"
    },
    "person_b": {
      "keep_doing": ["<thing 1>", "<thing 2>", "<thing 3>"],
      "improve": ["<thing 1>", "<thing 2>"],
      "experiment": "<specific, actionable experiment>"
    },
    "together": {
      "rituals": ["<ritual 1>", "<ritual 2>", "<ritual 3>"],
      "conversations": ["<experiment 1>", "<experiment 2>"],
      "challenge": "<one challenge to try together>"
    },
    "strengthen_steps": ["<step 1>", "<step 2>", "<step 3>"]
  },
  "love_romance": {
    "relationship_type": "platonic_friends|best_friends_with_tension|situationship|dating|established_couple|exes_staying_in_touch|one_sided_crush_a_to_b|one_sided_crush_b_to_a|mutual_unspoken_crush|unclear",
    "type_confidence": <0-100>,
    "type_explanation": "<3-5 sentences explaining why you classified the relationship this way. Reference specific patterns, topics, or message styles observed. If unclear, explain what makes it ambiguous.>",
    "chemistry_score": <0-100>,
    "chemistry_explanation": "<3-5 sentences explaining the chemistry score. What pushes it up or down? Is there a spark, tension, comfort, or distance?>",
    "romantic_signals": ["<specific romantic signal 1 with evidence>", "<signal 2>", "..."],
    "platonic_signals": ["<specific platonic signal 1 with evidence>", "<signal 2>", "..."],
    "flirtation_intensity": {
      "A": <0-10>,
      "B": <0-10>
    },
    "flirtation_style": {
      "A": "<description of how A flirts, or 'No observable flirtation'>",
      "B": "<description of how B flirts, or 'No observable flirtation'>"
    },
    "terms_of_endearment": ["<pet names / terms of endearment used, or 'none observed'>"],
    "physical_romantic_references": ["<any physical or romantic references — missing each other, hugs, kisses, 'wish you were here', etc. — or 'none observed'>"],
    "emotional_intimacy_level": "typical_friendship|elevated|high|romantic",
    "emotional_intimacy_evidence": "<2-4 sentences citing evidence for the intimacy level>",
    "jealousy_indicators": {
      "present": <true|false>,
      "description": "<if present, describe; otherwise 'No jealousy indicators observed'>"
    },
    "future_references": {
      "present": <true|false>,
      "description": "<if present, describe references to a shared future; otherwise 'No shared-future references observed'>"
    },
    "couple_potential": {
      "score": <0-100>,
      "reasoning": "<3-5 sentences. If they're already a couple, discuss how strong the couple is. If they're not, discuss whether they would work as one and why.>"
    },
    "notable_moments": ["<memorable romantic/chemistry moment 1 with quote or paraphrase>", "<moment 2>", "...or 'none observed'"],
    "verdict": "<one punchy sentence that captures the romantic dimension of this relationship>"
  },
  "closing_thought": "<2-4 sentence memorable closing thought about this friendship>"
}

# ANALYSIS CONTEXT

Person A: ${personA}
Person B: ${personB}
Timeframe: ${timeframe}
Total messages analyzed: ${totalMessageCount}

# AGGREGATED WEEKLY/MONTHLY SUMMARIES

${aggregatedSummaries}

# INSTRUCTIONS

1. Be specific - reference actual patterns, topics, and quotes from the summaries
2. Each text field should be substantive (not just a few words) - aim for 2-5 sentences for descriptions
3. For scores, use integers within the specified range
4. For percentages, use integers 0-100
5. Quote actual phrases from the summaries as evidence where possible
6. Be honest but kind - never cruel
7. Use the same Person A / Person B labels consistently (${personA} = A, ${personB} = B)
8. Return ONLY the JSON object, no markdown fences, no preamble, no postscript

Return the JSON now.`}

function personalityProfileSchema(label: "A" | "B", name: string): string {
  return `{
    "name": "${name}",
    "communication_dna": {
      "message_length": "terse|moderate|verbose",
      "message_length_consistency": "<description>",
      "response_speed": "instant|moderate|slow",
      "response_speed_variations": "<does this vary by topic>",
      "emoji_usage": "minimal|moderate|heavy",
      "emoji_types": "<what types - hearts, laughing, thumbs up, etc>",
      "language_style": "formal|casual|very_informal",
      "verbal_tics": "<any catchphrases or tics, or 'none observed'>",
      "question_ratio": "investigator|sharer|balanced",
      "initiation_pattern": "frequent_initiator|mostly_responder|balanced"
    },
    "personality_traits": {
      "big_five": {
        "openness": <1-10>,
        "conscientiousness": <1-10>,
        "extraversion": <1-10>,
        "agreeableness": <1-10>,
        "neuroticism": <1-10>
      },
      "big_five_evidence": {
        "openness": "<evidence>",
        "conscientiousness": "<evidence>",
        "extraversion": "<evidence>",
        "agreeableness": "<evidence>",
        "neuroticism": "<evidence>"
      },
      "mbti_informed": {
        "extraverted_vs_introverted": "Extraverted|Introverted|Ambivert",
        "facts_vs_ideas": "Facts|Ideas|Both",
        "logical_vs_feeling": "Logical|Feeling|Both",
        "structured_vs_spontaneous": "Structured|Spontaneous|Both"
      },
      "attachment_style": "secure|anxious|avoidant|mixed",
      "attachment_evidence": "<2-3 sentences>"
    },
    "emotional_expression": {
      "excitement_style": "<caps, exclamation marks, emojis, rapid messages - description>",
      "frustration_style": "<direct confrontation, passive aggression, silence, sarcasm, venting>",
      "vulnerability_comfort": "low|moderate|high",
      "vulnerability_examples": "<examples of deep sharing vs deflection>",
      "response_to_others_vulnerability": "supportive|dismissive|uncomfortable|matching",
      "expressive_topics": ["<topic 1>", "<topic 2>"]
    },
    "digital_signature": {
      "most_active_time": "<time of day>",
      "what_time_suggests": "<1-2 sentences>",
      "weekend_vs_weekday": "<differences>",
      "modes": ["<work mode>", "<chill mode>", "<deep talk mode>", "<meme mode>"],
      "signature_moves": ["<unique behavior 1>", "<unique behavior 2>"]
    }
  }`;
}
