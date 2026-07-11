"use client";

import * as React from "react";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  ChevronDown,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAnalyzerStore } from "@/lib/store";
import {
  PROVIDER_MODELS,
  PROVIDER_INFO,
  LLMClient,
  type Provider,
} from "@/lib/llm-client";
import { parseWhatsAppChat, getChatStats } from "@/lib/whatsapp-parser";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function LandingScreen() {
  const {
    provider,
    apiKey,
    fastModel,
    capableModel,
    apiKeyValid,
    validatingKey,
    fileName,
    fileSize,
    parseResult,
    parseError,
    parsing,
    consentGiven,
    setProvider,
    setApiKey,
    setFastModel,
    setCapableModel,
    setApiKeyValid,
    setValidatingKey,
    setFile,
    setParseResult,
    setParseError,
    setParsing,
    setConsent,
    setScreen,
    setProgress,
    setReport,
    setReportMeta,
    setErrorMessage,
  } = useAnalyzerStore();

  const { toast } = useToast();
  const [dragActive, setDragActive] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cancelRef = React.useRef<boolean>(false);

  // Validate API key
  const handleValidateKey = React.useCallback(async () => {
    if (!apiKey.trim()) {
      setApiKeyValid(false);
      return;
    }
    setValidatingKey(true);
    try {
      const client = new LLMClient({
        provider: provider as Provider,
        apiKey: apiKey.trim(),
        fastModel,
        capableModel,
      });
      const result = await client.validateKey();
      if (result.valid) {
        setApiKeyValid(true);
        const sameModel = fastModel === capableModel;
        toast({
          title: "API key validated",
          description: sameModel
            ? `Connected to ${PROVIDER_INFO[provider as Provider].name} — model "${fastModel}" works.`
            : `Connected to ${PROVIDER_INFO[provider as Provider].name} — both models work.`,
        });
      } else {
        setApiKeyValid(false);
        if (result.reason === "model_unavailable") {
          toast({
            title: `Model "${result.model}" not available`,
            description: result.message,
            variant: "destructive",
          });
        } else if (result.reason === "invalid_api_key") {
          toast({
            title: "Invalid API key",
            description: `Please check your ${PROVIDER_INFO[provider as Provider].name} key.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Validation failed",
            description: result.message,
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      setApiKeyValid(false);
      toast({
        title: "Validation failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setValidatingKey(false);
    }
  }, [apiKey, provider, fastModel, capableModel, setApiKeyValid, setValidatingKey, toast]);

  // Handle file upload + parse
  const handleFile = React.useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".txt")) {
        setParseError("Please upload a .txt file (your WhatsApp chat export).");
        return;
      }
      setFile(file.name, file.size);
      setParsing(true);
      setParseError(null);
      try {
        const text = await file.text();
        const result = parseWhatsAppChat(text);
        if (result.messages.length === 0) {
          setParseError(
            "No messages found in this file. Make sure you exported your WhatsApp chat as text (without media)."
          );
          setParseResult(null);
        } else if (result.participants.length < 2) {
          setParseError(
            "Could not detect two participants in this chat. The file format may be unrecognized."
          );
          setParseResult(null);
        } else {
          setParseResult(result);
          const stats = getChatStats(result);
          toast({
            title: "Chat parsed",
            description: `${result.messages.length} messages between ${result.participants[0]} and ${result.participants[1]}.`,
          });
        }
      } catch (err) {
        setParseError(`Failed to parse: ${(err as Error).message}`);
        setParseResult(null);
      } finally {
        setParsing(false);
      }
    },
    [setFile, setParsing, setParseError, setParseResult, toast]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Start analysis
  const canAnalyze =
    apiKeyValid === true &&
    parseResult !== null &&
    consentGiven &&
    !parsing;

  const handleAnalyze = async () => {
    if (!canAnalyze || !parseResult) return;

    setProgress({
      phase: 1,
      phaseName: "Initializing",
      current: 0,
      total: 1,
      message: "Setting up analysis pipeline...",
    });
    setReport(null);
    setReportMeta(null);
    setErrorMessage(null);
    setScreen("analyzing");
    cancelRef.current = false;
    useAnalyzerStore.setState({ cancelRequested: false });

    try {
      // Dynamically import to keep initial bundle small
      const { runAnalysis } = await import("@/lib/analyzer");
      const client = new LLMClient({
        provider: provider as Provider,
        apiKey: apiKey.trim(),
        fastModel,
        capableModel,
      });

      const result = await runAnalysis({
        parseResult,
        client,
        onProgress: (p) => setProgress(p),
        isCancelled: () => useAnalyzerStore.getState().cancelRequested,
        onCooldown: (seconds, message) =>
          useAnalyzerStore.setState({
            cooldown: { seconds, message },
          }),
      });

      const dateRange = parseResult.dateRange;
      setReport(result.report);
      setReportMeta({
        personA: parseResult.participants[0],
        personB: parseResult.participants[1],
        timeframe: dateRange
          ? `${dateRange.start.toLocaleDateString("en-US", { month: "short", year: "numeric" })} to ${dateRange.end.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
          : "the analyzed period",
        totalMessages: parseResult.messages.length,
        dateRange: dateRange
          ? {
              start: dateRange.start.toISOString(),
              end: dateRange.end.toISOString(),
            }
          : { start: "", end: "" },
        generatedAt: new Date().toISOString(),
        provider: provider as string,
        fastModel,
        capableModel,
      });
      setScreen("report");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("cancelled")) {
        setScreen("landing");
        setProgress(null);
        return;
      }
      setErrorMessage(msg);
      setScreen("error");
    }
  };

  const stats = parseResult ? getChatStats(parseResult) : null;

  return (
    <div className="brand-gradient relative min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-brand-foreground brand-pulse">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Chat Dynamics Analyzer
          </h1>
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            Upload a WhatsApp chat export and get a comprehensive, MBTI-style
            friendship analysis. Personality profiles, relationship dynamics,
            humor analysis, and more — all generated through your own LLM API key.
          </p>
        </div>

        {/* API Key Section */}
        <section
          aria-labelledby="api-key-heading"
          className="report-card mb-6 rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm sm:p-6"
        >
          <h2
            id="api-key-heading"
            className="mb-1 text-base font-semibold sm:text-lg"
          >
            1. Connect your LLM API key
          </h2>
          <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
            Your key is kept in browser memory only and never sent to our servers.
            All LLM calls go directly from your browser to the provider.
          </p>

          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <div>
              <Label htmlFor="provider" className="mb-1.5 block text-xs">
                Provider
              </Label>
              <Select
                value={provider}
                onValueChange={(v) => setProvider(v as Provider)}
              >
                <SelectTrigger id="provider" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col items-start">
                        <span>{info.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {PROVIDER_INFO[provider as Provider].description}
              </p>
              {PROVIDER_INFO[provider as Provider].rateLimits && (
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  {PROVIDER_INFO[provider as Provider].rateLimits}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="api-key" className="mb-1.5 block text-xs">
                API Key
              </Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Paste your API key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-xs"
                  autoComplete="off"
                  spellCheck={false}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleValidateKey}
                  disabled={!apiKey.trim() || validatingKey}
                  className="shrink-0"
                >
                  {validatingKey ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Checking
                    </>
                  ) : apiKeyValid === true ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3 text-positive" />
                      Valid
                    </>
                  ) : (
                    "Validate"
                  )}
                </Button>
              </div>
              {apiKeyValid === false && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-concern">
                  <AlertCircle className="h-3 w-3" />
                  Invalid key. Please check and try again.
                </p>
              )}
              {apiKeyValid === true && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-positive">
                  <CheckCircle2 className="h-3 w-3" />
                  Key works with {PROVIDER_INFO[provider as Provider].name}.
                </p>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="mt-4 rounded-lg border border-border/50 bg-muted/40 p-3 text-xs">
            <div className="mb-1.5 flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5 text-brand-accent" />
              Don&apos;t have an API key? Get one free from:
            </div>
            <ul className="space-y-1 pl-5 text-muted-foreground">
              <li>
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 hover:text-foreground"
                >
                  Groq
                </a>
                : https://console.groq.com{" "}
                <span className="text-muted-foreground/70">
                  (fastest processing, recommended)
                </span>
              </li>
              <li>
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 hover:text-foreground"
                >
                  Google AI Studio
                </a>
                : https://aistudio.google.com{" "}
                <span className="text-muted-foreground/70">
                  (free tier available)
                </span>
              </li>
              <li>
                <a
                  href="https://platform.openai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 hover:text-foreground"
                >
                  OpenAI
                </a>
                : https://platform.openai.com
              </li>
            </ul>
          </div>

          {/* Advanced model selection */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 h-7 px-2 text-xs text-muted-foreground"
              >
                <ChevronDown
                  className={cn(
                    "mr-1 h-3 w-3 transition-transform",
                    showAdvanced && "rotate-180"
                  )}
                />
                Advanced: choose specific models
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fast-model" className="mb-1 block text-[11px]">
                    Fast model (Phase 1 chunks)
                  </Label>
                  <Input
                    id="fast-model"
                    type="text"
                    list="fast-model-suggestions"
                    value={fastModel}
                    onChange={(e) => setFastModel(e.target.value)}
                    className="font-mono text-xs"
                    placeholder="e.g. gemini-3.1-flash-lite"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <datalist id="fast-model-suggestions">
                    {PROVIDER_MODELS[provider as Provider].fast.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <Label
                    htmlFor="capable-model"
                    className="mb-1 block text-[11px]"
                  >
                    Capable model (Phase 3 report)
                  </Label>
                  <Input
                    id="capable-model"
                    type="text"
                    list="capable-model-suggestions"
                    value={capableModel}
                    onChange={(e) => setCapableModel(e.target.value)}
                    className="font-mono text-xs"
                    placeholder="e.g. gemini-3.1-flash-lite"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  <datalist id="capable-model-suggestions">
                    {PROVIDER_MODELS[provider as Provider].capable.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                You can type any model name your API key supports — the dropdown
                is just suggestions. If you change the model, click{" "}
                <strong>Validate</strong> again to confirm it works.
              </p>
              {provider === "google" && (
                <p className="rounded-md border border-brand/30 bg-brand/5 p-2 text-[10px] text-foreground/80">
                  <strong>Google note:</strong> The free tier of Google AI
                  Studio only provides quota for{" "}
                  <code className="font-mono">gemini-3.1-flash-lite</code>{" "}
                  (15 RPM, 250K TPM, 500 RPD). All other models show 0 quota on
                  the dashboard, so this single model is used for both Phase 1
                  (chunk processing) and Phase 3 (final report). Keep both
                  fields set to <code className="font-mono">gemini-3.1-flash-lite</code>.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </section>

        {/* File Upload Section */}
        <section
          aria-labelledby="upload-heading"
          className="report-card mb-6 rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm sm:p-6"
        >
          <h2
            id="upload-heading"
            className="mb-1 text-base font-semibold sm:text-lg"
          >
            2. Upload your WhatsApp chat export
          </h2>
          <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
            Export your chat from WhatsApp → &quot;Export Chat&quot; → &quot;Without
            Media&quot;. You&apos;ll get a .txt file.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload chat file (drag and drop or click to browse)"
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              dragActive
                ? "border-brand bg-brand/5"
                : "border-border hover:border-brand/60 hover:bg-muted/30",
              parsing && "pointer-events-none opacity-60"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              className="sr-only"
              onChange={onFileChange}
            />
            {parsing ? (
              <>
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-brand" />
                <p className="text-sm font-medium">Parsing chat...</p>
              </>
            ) : fileName ? (
              <>
                <FileText className="mb-2 h-8 w-8 text-brand" />
                <p className="text-sm font-medium" title={fileName}>
                  {fileName.length > 50
                    ? fileName.slice(0, 47) + "..."
                    : fileName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(fileSize / 1024).toFixed(1)} KB
                  {parseResult && (
                    <>
                      {" "}
                      • {parseResult.messages.length} messages •{" "}
                      {parseResult.participants.length} participants
                    </>
                  )}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Click to choose a different file
                </p>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drop your .txt file here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse
                </p>
              </>
            )}
          </div>

          {parseError && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-concern">
              <AlertCircle className="h-3.5 w-3.5" />
              {parseError}
            </p>
          )}

          {parseResult && stats && (
            <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-positive" />
                Chat preview
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <div className="text-muted-foreground">Person A</div>
                  <div className="font-medium">{parseResult.participants[0]}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {stats[parseResult.participants[0]]?.count ?? 0} messages
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Person B</div>
                  <div className="font-medium">{parseResult.participants[1]}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {stats[parseResult.participants[1]]?.count ?? 0} messages
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Date range</div>
                  <div className="font-medium">
                    {parseResult.dateRange
                      ? `${parseResult.dateRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })} – ${parseResult.dateRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total messages</div>
                  <div className="font-medium">
                    {parseResult.messages.length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Consent + Privacy */}
        <section className="mb-6 space-y-3">
          <label
            htmlFor="consent"
            className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border/50 bg-card/40 p-3 text-xs"
          >
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(v) => setConsent(v === true)}
              className="mt-0.5"
            />
            <span className="text-foreground/90">
              I confirm this is my own chat or I have permission from all
              parties to analyze it.
            </span>
          </label>

          <div className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-muted/30 p-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
            <span>
              Your chats are processed in real-time through your own API key.
              Nothing is stored on our servers. All analysis happens directly
              between your browser and the API provider.
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Tip: To anonymize, use Find-Replace in a text editor to swap names
            before uploading. This is suggested but not required.
          </p>

          <div className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-muted/30 p-3 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-accent" />
            <span>
              <strong className="text-foreground/80">No limits are imposed by us.</strong>{" "}
              Any rate limits, daily caps, or quota errors you encounter come
              directly from your chosen API provider (Groq, Google, or OpenAI).
              We batch multiple chunks per API call to minimize requests and
              respect provider limits automatically.
            </span>
          </div>
        </section>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          size="lg"
          className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze Chat
        </Button>

        {!canAnalyze && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            {!apiKeyValid
              ? "Validate your API key to continue"
              : !parseResult
                ? "Upload a chat file to continue"
                : !consentGiven
                  ? "Please confirm consent to continue"
                  : ""}
          </p>
        )}
      </div>

      {/* Creator credit — bottom-left, fixed */}
      <div className="no-print pointer-events-none fixed bottom-3 left-4 z-20 select-none text-[11px] text-muted-foreground/70">
        <span className="font-medium">Created by</span>{" "}
        <span className="font-semibold text-foreground/80">Farhan Ch</span>
      </div>
    </div>
  );
}
