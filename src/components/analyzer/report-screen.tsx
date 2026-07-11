"use client";

import * as React from "react";
import {
  Download,
  RefreshCw,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  MessageSquare,
  Heart,
  Smile,
  Activity,
  Clock,
  GitCompare,
  Lightbulb,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAnalyzerStore } from "@/lib/store";
import { ReportSidebar } from "./report-sidebar";
import {
  ReportSection,
  SubHeading,
  Field,
  StatusPill,
  ScoreMeter,
  DefList,
} from "./report-section";
import { PersonalityRadar } from "./charts/personality-radar";
import { TopicBarChart } from "./charts/topic-bar-chart";
import { ComparisonBarChart } from "./charts/comparison-bar-chart";
import { ScoreBarChart } from "./charts/score-bar-chart";
import type {
  AnalysisReport,
  PersonalityProfile,
} from "@/lib/report-types";

export function ReportScreen() {
  const { report, reportMeta, reset } = useAnalyzerStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  if (!report || !reportMeta) {
    return null;
  }

  const { personA, personB } = reportMeta;

  const handleDownloadPdf = () => {
    // Expand all collapsed sections before printing so the PDF contains everything
    const sections = document.querySelectorAll('[data-state="collapsed"]');
    sections.forEach((s) => {
      const trigger = s.querySelector('button[aria-expanded="false"]');
      if (trigger) (trigger as HTMLElement).click();
    });
    // Wait a tick for the DOM to update, then print
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleAnalyzeAnother = () => {
    reset();
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Action bar (no-print) */}
      <div className="report-action-bar no-print sticky top-14 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2 sm:px-6">
          {/* Mobile sidebar trigger */}
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="mr-1 h-4 w-4" />
                Sections
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 overflow-y-auto p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Report sections</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ReportSidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden text-xs text-muted-foreground sm:block">
            Report generated {new Date(reportMeta.generatedAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleAnalyzeAnother}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              New
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Desktop sidebar */}
        <aside className="report-sidebar no-print sticky top-[7.5rem] hidden h-[calc(100vh-9rem)] w-56 shrink-0 overflow-y-auto scroll-area-thin lg:block">
          <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            On this page
          </div>
          <ReportSidebar />
        </aside>

        {/* Main content */}
        <main className="report-main min-w-0 flex-1 space-y-4">
          {/* Cover */}
          <div className="report-card rounded-xl border border-border/60 bg-gradient-to-br from-card/60 to-card/30 p-6 backdrop-blur-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-0.5 text-[11px] font-medium text-brand">
                  <Sparkles className="h-3 w-3" />
                  Friendship Analysis Report
                </div>
                <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
                  {personA} <span className="text-muted-foreground">×</span>{" "}
                  {personB}
                </h1>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {reportMeta.timeframe} •{" "}
                  {reportMeta.totalMessages.toLocaleString()} messages analyzed
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Health score
                </div>
                <div className="text-3xl font-bold text-brand">
                  {report.executive_summary.health_score}
                  <span className="text-base text-muted-foreground">/10</span>
                </div>
              </div>
            </div>
          </div>

          <ExecutiveSummarySection report={report} personA={personA} personB={personB} />
          <PersonalityProfilesSection report={report} personA={personA} personB={personB} />
          <RelationshipDynamicsSection report={report} personA={personA} personB={personB} />
          <CommunicationPatternsSection report={report} personA={personA} personB={personB} />
          <TopicEcosystemSection report={report} />
          <EmotionalLandscapeSection report={report} personA={personA} personB={personB} />
          <HumorAnalysisSection report={report} personA={personA} personB={personB} />
          <HealthAssessmentSection report={report} />
          <TemporalPatternsSection report={report} personA={personA} personB={personB} />
          <ComparativeAnalysisSection report={report} personA={personA} personB={personB} />
          <PredictiveInsightsSection report={report} />
          <RecommendationsSection report={report} personA={personA} personB={personB} />
          <LoveRomanceSection report={report} personA={personA} personB={personB} />
          <ClosingSection report={report} />

          {/* Disclaimer footer */}
          <div className="mt-8 rounded-lg border border-border/40 bg-muted/20 p-4 text-[11px] text-muted-foreground">
            <p className="font-medium text-foreground/80">
              Disclaimer
            </p>
            <p className="mt-1">
              This analysis is for entertainment and self-reflection purposes
              only. It is not a clinical psychological assessment. Do not use
              this to make serious decisions about relationships. All analysis
              was generated by an LLM via your own API key and may contain
              inaccuracies or hallucinations.
            </p>
            <p className="mt-2">
              Generated with {reportMeta.provider} ({reportMeta.fastModel} for
              chunk processing, {reportMeta.capableModel} for final report).
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section components
// ─────────────────────────────────────────────────────────────

function ExecutiveSummarySection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const { executive_summary: es } = report;
  return (
    <ReportSection
      id="executive-summary"
      title="Executive Summary"
      subtitle="The big picture, at a glance"
      icon={<Sparkles className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-background/40 p-3">
            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Friendship health score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-brand">
                {es.health_score}
              </span>
              <span className="text-sm text-muted-foreground">/ 10</span>
            </div>
            <ScoreMeter
              value={es.health_score}
              tone={
                es.health_score >= 7
                  ? "positive"
                  : es.health_score >= 4
                    ? "warning"
                    : "concern"
              }
            />
            <p className="mt-2 text-xs text-foreground/80">
              {es.health_justification}
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-background/40 p-3">
            <div className="mb-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Essence of this friendship
            </div>
            <p className="text-sm italic text-foreground/90">
              &ldquo;{es.essence_sentence}&rdquo;
            </p>
          </div>
        </div>

        <div>
          <SubHeading>Friendship archetype scores</SubHeading>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {es.archetypes.map((a) => (
              <div
                key={a.name}
                className="flex items-center justify-between gap-3 rounded-md border border-border/40 bg-background/30 px-3 py-2"
              >
                <span className="text-xs text-foreground/80">{a.name}</span>
                <ScoreMeter
                  value={a.score}
                  tone={a.score >= 7 ? "positive" : a.score >= 4 ? "brand" : "neutral"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <SubHeading>Key strengths</SubHeading>
            <ul className="space-y-1.5">
              {es.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubHeading>Areas for growth</SubHeading>
            <ul className="space-y-1.5">
              {es.growth_areas.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-brand">
            <Sparkles className="h-3 w-3" />
            Most surprising finding
          </div>
          <p className="text-sm text-foreground/90">
            {es.surprising_finding}
          </p>
        </div>
      </div>
    </ReportSection>
  );
}

function PersonalityProfileCard({
  profile,
  label,
  name,
}: {
  profile: PersonalityProfile;
  label: "A" | "B";
  name: string;
}) {
  const bigFive = profile.personality_traits.big_five;
  return (
    <div className="space-y-3 rounded-lg border border-border/40 bg-background/30 p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Person {label}
          </div>
          <div className="text-base font-semibold">{name}</div>
        </div>
        <StatusPill
          value={`Attachment: ${profile.personality_traits.attachment_style}`}
          tone="brand"
        />
      </div>

      <SubHeading>Communication DNA</SubHeading>
      <DefList
        items={[
          { label: "Message length", value: profile.communication_dna.message_length },
          { label: "Consistency", value: profile.communication_dna.message_length_consistency },
          { label: "Response speed", value: profile.communication_dna.response_speed },
          { label: "Speed variation", value: profile.communication_dna.response_speed_variations },
          { label: "Emoji usage", value: `${profile.communication_dna.emoji_usage} — ${profile.communication_dna.emoji_types}` },
          { label: "Language style", value: profile.communication_dna.language_style },
          { label: "Verbal tics", value: profile.communication_dna.verbal_tics },
          { label: "Question ratio", value: profile.communication_dna.question_ratio },
          { label: "Initiation", value: profile.communication_dna.initiation_pattern },
        ]}
      />

      <SubHeading>Big Five personality traits</SubHeading>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(bigFive).map(([trait, value]) => (
          <div key={trait}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="capitalize text-muted-foreground">{trait}</span>
              <span className="font-medium">{value}/10</span>
            </div>
            <ScoreMeter
              value={value}
              tone={
                (trait === "neuroticism" && value >= 7) ||
                (trait !== "neuroticism" && value <= 3)
                  ? "warning"
                  : "brand"
              }
            />
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {profile.personality_traits.big_five_evidence[trait]}
            </p>
          </div>
        ))}
      </div>

      <SubHeading>MBTI-informed preferences</SubHeading>
      <DefList
        items={[
          { label: "Energy", value: profile.personality_traits.mbti_informed.extraverted_vs_introverted },
          { label: "Information", value: profile.personality_traits.mbti_informed.facts_vs_ideas },
          { label: "Decisions", value: profile.personality_traits.mbti_informed.logical_vs_feeling },
          { label: "Lifestyle", value: profile.personality_traits.mbti_informed.structured_vs_spontaneous },
        ]}
      />

      <div className="rounded-md border border-border/40 bg-muted/20 p-2.5 text-xs">
        <span className="font-medium">Attachment evidence: </span>
        <span className="text-muted-foreground">
          {profile.personality_traits.attachment_evidence}
        </span>
      </div>

      <SubHeading>Emotional expression</SubHeading>
      <DefList
        items={[
          { label: "Excitement style", value: profile.emotional_expression.excitement_style },
          { label: "Frustration style", value: profile.emotional_expression.frustration_style },
          { label: "Vulnerability comfort", value: <StatusPill value={profile.emotional_expression.vulnerability_comfort} tone={profile.emotional_expression.vulnerability_comfort === "high" ? "positive" : profile.emotional_expression.vulnerability_comfort === "low" ? "warning" : "neutral"} /> },
          { label: "Response to vulnerability", value: profile.emotional_expression.response_to_others_vulnerability },
          { label: "Examples", value: profile.emotional_expression.vulnerability_examples },
          { label: "Expressive topics", value: profile.emotional_expression.expressive_topics.join(", ") || "—" },
        ]}
      />

      <SubHeading>Digital signature</SubHeading>
      <DefList
        items={[
          { label: "Most active time", value: profile.digital_signature.most_active_time },
          { label: "What this suggests", value: profile.digital_signature.what_time_suggests },
          { label: "Weekend vs weekday", value: profile.digital_signature.weekend_vs_weekday },
          { label: "Modes", value: profile.digital_signature.modes.join(", ") || "—" },
          { label: "Signature moves", value: profile.digital_signature.signature_moves.join(", ") || "—" },
        ]}
      />
    </div>
  );
}

function PersonalityProfilesSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const a = report.personality_profiles.A;
  const b = report.personality_profiles.B;
  const radarData = [
    { trait: "Openness", A: a.personality_traits.big_five.openness, B: b.personality_traits.big_five.openness, fullMark: 10 },
    { trait: "Conscientious", A: a.personality_traits.big_five.conscientiousness, B: b.personality_traits.big_five.conscientiousness, fullMark: 10 },
    { trait: "Extraversion", A: a.personality_traits.big_five.extraversion, B: b.personality_traits.big_five.extraversion, fullMark: 10 },
    { trait: "Agreeable", A: a.personality_traits.big_five.agreeableness, B: b.personality_traits.big_five.agreeableness, fullMark: 10 },
    { trait: "Neuroticism", A: a.personality_traits.big_five.neuroticism, B: b.personality_traits.big_five.neuroticism, fullMark: 10 },
  ];

  const eiData = [
    { label: "Detect upset", A: report.emotional_landscape.emotional_intelligence.A.detect_upset, B: report.emotional_landscape.emotional_intelligence.B.detect_upset },
    { label: "Respond well", A: report.emotional_landscape.emotional_intelligence.A.respond_appropriately, B: report.emotional_landscape.emotional_intelligence.B.respond_appropriately },
    { label: "Advice vs listen", A: report.emotional_landscape.emotional_intelligence.A.advice_vs_listen, B: report.emotional_landscape.emotional_intelligence.B.advice_vs_listen },
    { label: "Respect bounds", A: report.emotional_landscape.emotional_intelligence.A.respect_boundaries, B: report.emotional_landscape.emotional_intelligence.B.respect_boundaries },
    { label: "Validate", A: report.emotional_landscape.emotional_intelligence.A.validate_feelings, B: report.emotional_landscape.emotional_intelligence.B.validate_feelings },
  ];

  return (
    <ReportSection
      id="personality-profiles"
      title="Individual Personality Profiles"
      subtitle="Who are these two people, as revealed by their texting?"
      icon={<Users className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PersonalityProfileCard profile={a} label="A" name={personA} />
          <PersonalityProfileCard profile={b} label="B" name={personB} />
        </div>

        <div>
          <SubHeading>Personality trait comparison (Big Five)</SubHeading>
          <PersonalityRadar
            personAName={personA}
            personBName={personB}
            data={radarData}
          />
        </div>

        <div>
          <SubHeading>Emotional intelligence comparison</SubHeading>
          <ComparisonBarChart
            personAName={personA}
            personBName={personB}
            data={eiData}
          />
        </div>
      </div>
    </ReportSection>
  );
}

function RelationshipDynamicsSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const rd = report.relationship_dynamics;
  return (
    <ReportSection
      id="relationship-dynamics"
      title="Relationship Dynamics Deep Dive"
      subtitle="Power, interdependence, reciprocity, and what holds it all together"
      icon={<GitCompare className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <SubHeading>Power dynamics</SubHeading>
        <DefList
          items={[
            { label: "Conversational power", value: rd.power_dynamics.conversational_power },
            { label: "Decision-making lead", value: rd.power_dynamics.decision_making_lead },
            { label: "Subject changer", value: rd.power_dynamics.subject_changer },
            { label: "Influence lead", value: rd.power_dynamics.influence_lead },
            {
              label: "Imbalance",
              value: rd.power_dynamics.imbalance_present ? (
                <StatusPill value="Present" tone="warning" />
              ) : (
                <StatusPill value="Balanced" tone="positive" />
              ),
            },
            { label: "Imbalance description", value: rd.power_dynamics.imbalance_description },
          ]}
        />

        <SubHeading>Interdependence</SubHeading>
        <DefList
          items={[
            { label: "Need vs want", value: rd.interdependence.need_vs_want },
            { label: "Emotional reliance", value: rd.interdependence.emotional_reliance },
            { label: "Information exclusivity", value: rd.interdependence.information_exclusivity },
            { label: "Life without friendship", value: rd.interdependence.life_without_friendship },
            {
              label: "Style",
              value: <StatusPill value={rd.interdependence.style} tone={rd.interdependence.style === "balanced" ? "positive" : "neutral"} />,
            },
          ]}
        />

        <SubHeading>Reciprocity scorecard</SubHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left">
                <th className="py-2 pr-3 font-medium text-muted-foreground">Behavior</th>
                <th className="py-2 pr-3 font-medium">{personA} (A)</th>
                <th className="py-2 pr-3 font-medium">{personB} (B)</th>
                <th className="py-2 font-medium">Balanced?</th>
              </tr>
            </thead>
            <tbody>
              {rd.reciprocity.map((row, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-2 pr-3 text-foreground/90">{row.behavior}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.person_a}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.person_b}</td>
                  <td className="py-2">
                    {row.balanced ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-positive" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs italic text-muted-foreground">{rd.reciprocity_note}</p>

        <SubHeading>The &ldquo;glue&rdquo; analysis — what holds this friendship together</SubHeading>
        <ScoreBarChart
          data={rd.glue_factors.map((f) => ({ label: f.factor, value: f.score }))}
          showValues
        />
        <p className="text-sm text-foreground/90">{rd.glue_summary}</p>
      </div>
    </ReportSection>
  );
}

function CommunicationPatternsSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const cp = report.communication_patterns;
  return (
    <ReportSection
      id="communication-patterns"
      title="Communication Patterns Analysis"
      subtitle="Flow, conflict, silence, and digital body language"
      icon={<MessageSquare className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <SubHeading>Conversation flow types</SubHeading>
        <div className="flex flex-wrap gap-1.5">
          {cp.flow_types.map((t, i) => (
            <StatusPill key={i} value={t} tone="brand" />
          ))}
        </div>
        <p className="text-sm text-foreground/90">{cp.flow_description}</p>

        <SubHeading>Conflict communication style</SubHeading>
        <DefList
          items={[
            { label: `${personA}'s style`, value: cp.conflict_style.person_a_style },
            { label: `${personB}'s style`, value: cp.conflict_style.person_b_style },
            { label: "Apologizes first", value: cp.conflict_style.apologizer_first },
            { label: "Apology genuineness", value: cp.conflict_style.apology_genuineness },
            {
              label: "Resolution",
              value: <StatusPill value={cp.conflict_style.conflict_resolution} tone={cp.conflict_style.conflict_resolution === "resolved" ? "positive" : "neutral"} />,
            },
            { label: "Frequency", value: cp.conflict_style.frequency },
            { label: "Healthiness", value: <StatusPill value={cp.conflict_style.healthiness} tone={cp.conflict_style.healthiness === "healthy" ? "positive" : cp.conflict_style.healthiness === "unhealthy" ? "concern" : "warning"} /> },
            { label: "Recurring topics", value: cp.conflict_style.recurring_topics.join(", ") || "—" },
          ]}
        />
        <p className="text-sm text-foreground/90">{cp.conflict_style.description}</p>

        <SubHeading>The silence analysis</SubHeading>
        <DefList
          items={[
            { label: "Silence meaning", value: cp.silence_analysis.silence_meaning },
            {
              label: "Comfort level",
              value: <StatusPill value={cp.silence_analysis.comfortable_or_anxious} tone={cp.silence_analysis.comfortable_or_anxious === "comfortable" ? "positive" : cp.silence_analysis.comfortable_or_anxious === "anxious" ? "concern" : "neutral"} />,
            },
            { label: "Check-in time", value: cp.silence_analysis.check_in_time },
            { label: "Left on read", value: cp.silence_analysis.left_on_read },
          ]}
        />

        <SubHeading>Digital body language</SubHeading>
        <DefList
          items={[
            { label: "'ok' meanings", value: cp.digital_body_language.ok_meanings },
            { label: "Punctuation patterns", value: cp.digital_body_language.punctuation_patterns },
            { label: "Capitalization", value: cp.digital_body_language.capitalization_patterns },
            { label: "Length as interest", value: cp.digital_body_language.length_as_interest },
          ]}
        />
      </div>
    </ReportSection>
  );
}

function TopicEcosystemSection({ report }: { report: AnalysisReport }) {
  const te = report.topic_ecosystem;
  return (
    <ReportSection
      id="topic-ecosystem"
      title="Topic Ecosystem Map"
      subtitle="What they talk about, how deep, and what they avoid"
      icon={<MessageSquare className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <SubHeading>Topic distribution (estimated %)</SubHeading>
        <TopicBarChart data={te.distribution} />
        <p className="text-xs italic text-muted-foreground">
          {te.distribution_note}
        </p>

        <SubHeading>Topic depth spectrum</SubHeading>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {te.depth.map((d, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-border/40 bg-background/30 px-3 py-1.5"
            >
              <span className="text-xs text-foreground/80">{d.topic}</span>
              <StatusPill
                value={d.level}
                tone={
                  d.level === "deep"
                    ? "positive"
                    : d.level === "avoided"
                      ? "concern"
                      : d.level === "surface"
                        ? "warning"
                        : "neutral"
                }
              />
            </div>
          ))}
        </div>

        <SubHeading>What they don&apos;t talk about</SubHeading>
        <div className="flex flex-wrap gap-1.5">
          {te.avoided_topics.length > 0 ? (
            te.avoided_topics.map((t, i) => (
              <StatusPill key={i} value={t} tone="concern" />
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              No conspicuously avoided topics detected.
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{te.avoided_topics_note}</p>

        <SubHeading>Niche interest universe</SubHeading>
        <div className="flex flex-wrap gap-1.5">
          {te.niche_interests.map((t, i) => (
            <StatusPill key={i} value={t} tone="brand" />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {te.niche_interests_note}
        </p>
      </div>
    </ReportSection>
  );
}

function EmotionalLandscapeSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const el = report.emotional_landscape;
  return (
    <ReportSection
      id="emotional-landscape"
      title="Emotional Landscape Analysis"
      subtitle="Valence, contagion, vulnerability, and EQ"
      icon={<Heart className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border/40 bg-background/30 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Positivity : negativity ratio
            </div>
            <div className="text-lg font-semibold text-brand">
              {el.valence_ratio}
            </div>
          </div>
          <div className="rounded-md border border-border/40 bg-background/30 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Emotional baseline
            </div>
            <div className="text-sm text-foreground/90">{el.baseline}</div>
          </div>
        </div>

        <p className="text-sm text-foreground/90">{el.valence_shift}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <SubHeading>Positive triggers</SubHeading>
            <ul className="space-y-1">
              {el.positive_triggers.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-positive" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubHeading>Negative triggers</SubHeading>
            <ul className="space-y-1">
              {el.negative_triggers.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <SubHeading>Emotional contagion patterns</SubHeading>
        <DefList
          items={[
            {
              label: `When ${personA} is down, ${personB} responds by`,
              value: el.contagion.a_down_b_response,
            },
            {
              label: `When ${personB} is down, ${personA} responds by`,
              value: el.contagion.b_down_a_response,
            },
            { label: `${personA}'s mood-improving effectiveness`, value: el.contagion.a_effectiveness },
            { label: `${personB}'s mood-improving effectiveness`, value: el.contagion.b_effectiveness },
          ]}
        />

        <SubHeading>Vulnerability matrix</SubHeading>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-left">
                <th className="py-2 pr-3 font-medium text-muted-foreground">Topic</th>
                <th className="py-2 pr-3 font-medium">{personA} comfort</th>
                <th className="py-2 pr-3 font-medium">{personB} comfort</th>
                <th className="py-2 font-medium">Shared level</th>
              </tr>
            </thead>
            <tbody>
              {el.vulnerability_matrix.map((row, i) => (
                <tr key={i} className="border-b border-border/30">
                  <td className="py-2 pr-3 text-foreground/90">{row.topic}</td>
                  <td className="py-2 pr-3">
                    <StatusPill
                      value={row.person_a_comfort}
                      tone={row.person_a_comfort === "High" ? "positive" : row.person_a_comfort === "Low" ? "concern" : "warning"}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <StatusPill
                      value={row.person_b_comfort}
                      tone={row.person_b_comfort === "High" ? "positive" : row.person_b_comfort === "Low" ? "concern" : "warning"}
                    />
                  </td>
                  <td className="py-2">
                    <StatusPill
                      value={row.shared_level}
                      tone={row.shared_level === "Mutual" ? "positive" : row.shared_level === "None" ? "concern" : "warning"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ReportSection>
  );
}

function HumorAnalysisSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const ha = report.humor_analysis;
  const humorData = [
    { label: "Self-deprecating", A: ha.A.self_deprecating, B: ha.B.self_deprecating },
    { label: "Sarcasm/irony", A: ha.A.sarcasm_irony, B: ha.B.sarcasm_irony },
    { label: "Dark humor", A: ha.A.dark_humor, B: ha.B.dark_humor },
    { label: "Wordplay/puns", A: ha.A.wordplay_puns, B: ha.B.wordplay_puns },
    { label: "Observational", A: ha.A.observational, B: ha.B.observational },
    { label: "Absurd/random", A: ha.A.absurd_random, B: ha.B.absurd_random },
    { label: "Reference", A: ha.A.reference_humor, B: ha.B.reference_humor },
    { label: "Roasting", A: ha.A.roasting_banter, B: ha.B.roasting_banter },
  ];
  return (
    <ReportSection
      id="humor-analysis"
      title="Humor Analysis"
      subtitle="Comedy signatures, dark humor limits, inside jokes"
      icon={<Smile className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <SubHeading>Humor style comparison</SubHeading>
        <ComparisonBarChart
          personAName={personA}
          personBName={personB}
          data={humorData}
        />

        <SubHeading>Dark humor boundaries</SubHeading>
        <p className="text-sm text-foreground/90">{ha.dark_humor_boundaries}</p>

        <SubHeading>Inside joke ecosystem</SubHeading>
        <DefList
          items={[
            { label: "Estimated count", value: ha.inside_jokes.estimated_count },
            { label: "Longevity", value: ha.inside_jokes.longevity },
            { label: "Classic callbacks", value: ha.inside_jokes.classic_callbacks.join("; ") || "—" },
            {
              label: "Outsider would be lost",
              value: ha.inside_jokes.outsider_lost ? (
                <StatusPill value="Yes, completely" tone="brand" />
              ) : (
                <StatusPill value="Not really" tone="neutral" />
              ),
            },
          ]}
        />

        <SubHeading>Compatibility</SubHeading>
        <DefList
          items={[
            { label: "Shared sense of humor", value: ha.compatibility.shared_funny },
            { label: "Engagement", value: ha.compatibility.engagement },
            {
              label: "Bonding mechanism",
              value: <StatusPill value={ha.compatibility.bonding_mechanism} tone={ha.compatibility.bonding_mechanism === "major" ? "positive" : "neutral"} />,
            },
            { label: "Mismatches", value: ha.compatibility.mismatches },
          ]}
        />
      </div>
    </ReportSection>
  );
}

function HealthAssessmentSection({ report }: { report: AnalysisReport }) {
  const ha = report.health_assessment;
  return (
    <ReportSection
      id="health-assessment"
      title="Relationship Health Assessment"
      subtitle="Green flags, yellow flags, red flags"
      icon={<Activity className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-border/40 bg-background/40 p-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Overall health score
              </div>
              <div className="text-3xl font-bold text-brand">
                {ha.overall_score}
                <span className="text-base text-muted-foreground">/10</span>
              </div>
            </div>
            <StatusPill
              value={`Compared to average: ${ha.comparison_to_average}`}
              tone={ha.comparison_to_average === "above" ? "positive" : ha.comparison_to_average === "below" ? "concern" : "warning"}
            />
          </div>
          <ScoreMeter
            value={ha.overall_score}
            tone={ha.overall_score >= 7 ? "positive" : ha.overall_score >= 4 ? "warning" : "concern"}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-positive/30 bg-positive-soft p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-positive">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Green flags ({ha.green_flags.length})
            </div>
            <ul className="space-y-1">
              {ha.green_flags.map((f, i) => (
                <li key={i} className="text-[11px] text-foreground/80">{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-warning/30 bg-warning-soft p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-warning">
              <AlertTriangle className="h-3.5 w-3.5" />
              Yellow flags ({ha.yellow_flags.length})
            </div>
            <ul className="space-y-1">
              {ha.yellow_flags.map((f, i) => (
                <li key={i} className="text-[11px] text-foreground/80">{f}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border border-concern/30 bg-concern-soft p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-concern">
              <AlertTriangle className="h-3.5 w-3.5" />
              Red flags ({ha.red_flags.length})
            </div>
            {ha.red_flags.length > 0 ? (
              <ul className="space-y-1">
                {ha.red_flags.map((f, i) => (
                  <li key={i} className="text-[11px] text-foreground/80">{f}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                None detected. 🎉
              </p>
            )}
          </div>
        </div>

        <DefList
          items={[
            { label: "Primary strength", value: ha.primary_strength },
            { label: "Primary risk to watch", value: ha.primary_risk },
          ]}
        />
        <p className="text-sm text-foreground/90">{ha.assessment}</p>
      </div>
    </ReportSection>
  );
}

function TemporalPatternsSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const tp = report.temporal_patterns;
  return (
    <ReportSection
      id="temporal-patterns"
      title="Temporal Patterns"
      subtitle="Daily rhythms, weekly flows, evolution over time"
      icon={<Clock className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <SubHeading>Daily rhythm</SubHeading>
        <DefList
          items={[
            { label: `${personA}'s peak hours`, value: tp.daily_rhythm.peak_hours_A },
            { label: `${personB}'s peak hours`, value: tp.daily_rhythm.peak_hours_B },
            {
              label: "Sync",
              value: <StatusPill value={tp.daily_rhythm.sync} tone={tp.daily_rhythm.sync === "synced" ? "positive" : "neutral"} />,
            },
            { label: "Morning vs night", value: tp.daily_rhythm.morning_vs_night },
          ]}
        />
        <p className="text-xs text-muted-foreground">{tp.daily_rhythm.effect_on_connection}</p>

        <SubHeading>Weekly rhythm</SubHeading>
        <DefList
          items={[
            { label: "Busier days", value: tp.weekly_rhythm.busier_days },
            { label: "End of week pattern", value: tp.weekly_rhythm.end_of_week_pattern },
            { label: "Beginning of week pattern", value: tp.weekly_rhythm.beginning_of_week_pattern },
          ]}
        />

        <SubHeading>Seasonal patterns</SubHeading>
        <p className="text-sm text-foreground/90">{tp.seasonal_patterns}</p>

        <SubHeading>Evolution over time</SubHeading>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-md border border-border/40 bg-background/30 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Month 1</div>
            <div className="text-xs">{tp.evolution.month_1}</div>
          </div>
          <div className="rounded-md border border-border/40 bg-background/30 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Month 6</div>
            <div className="text-xs">{tp.evolution.month_6}</div>
          </div>
          <div className="rounded-md border border-border/40 bg-background/30 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Month 12</div>
            <div className="text-xs">{tp.evolution.month_12}</div>
          </div>
        </div>
        <DefList
          items={[
            {
              label: "Trajectory",
              value: <StatusPill value={tp.evolution.trajectory} tone={tp.evolution.trajectory === "closer" ? "positive" : tp.evolution.trajectory === "drifting" ? "concern" : "neutral"} />,
            },
            { label: "Notable shifts", value: tp.evolution.shifts },
          ]}
        />
      </div>
    </ReportSection>
  );
}

function ComparativeAnalysisSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const ca = report.comparative_analysis;
  return (
    <ReportSection
      id="comparative-analysis"
      title="Comparative Analysis"
      subtitle="Similarity, complementarity, friction"
      icon={<GitCompare className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <SubHeading>Similarity assessment</SubHeading>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Communication", value: ca.similarity.communication_overlap },
            { label: "Interests", value: ca.similarity.interest_overlap },
            { label: "Personality", value: ca.similarity.personality_overlap },
            { label: "Values", value: ca.similarity.value_alignment },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-md border border-border/40 bg-background/30 p-2.5 text-center"
            >
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
              <div className="text-xl font-bold text-brand">{s.value}%</div>
              <ScoreMeter value={s.value} max={100} tone="brand" />
            </div>
          ))}
        </div>
        <div className="text-center text-sm">
          Overall similarity:{" "}
          <StatusPill
            value={ca.similarity.overall}
            tone={ca.similarity.overall === "High" ? "positive" : ca.similarity.overall === "Low" ? "warning" : "neutral"}
          />
        </div>

        <SubHeading>Complementarity — how they balance each other</SubHeading>
        <ul className="space-y-1.5">
          {ca.complementarity.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <SubHeading>Friction points</SubHeading>
        <ul className="space-y-1.5">
          {ca.friction_points.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>{c}</span>
            </li>
          ))}
        </ul>

        <SubHeading>The &ldquo;completed puzzle&rdquo; factor</SubHeading>
        <p className="text-sm text-foreground/90">{ca.puzzle_factor}</p>
      </div>
    </ReportSection>
  );
}

function PredictiveInsightsSection({ report }: { report: AnalysisReport }) {
  const pi = report.predictive_insights;
  return (
    <ReportSection
      id="predictive-insights"
      title="Predictive Insights"
      subtitle="Where this friendship is heading, and how it would handle challenges"
      icon={<TrendingUp className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <SubHeading>Future trajectory (next 6–12 months)</SubHeading>
        <div className="rounded-md border border-border/40 bg-background/30 p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Prediction:</span>
            <StatusPill
              value={pi.trajectory_6_12_months.prediction}
              tone={pi.trajectory_6_12_months.prediction === "closer" ? "positive" : pi.trajectory_6_12_months.prediction === "drift" ? "concern" : "neutral"}
            />
            <StatusPill
              value={`Confidence: ${pi.trajectory_6_12_months.confidence}`}
              tone="neutral"
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Challenge areas
              </div>
              <ul className="space-y-1">
                {pi.trajectory_6_12_months.challenge_areas.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Positive developments
              </div>
              <ul className="space-y-1">
                {pi.trajectory_6_12_months.positive_developments.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-positive" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <SubHeading>&ldquo;If X happens&rdquo; scenarios</SubHeading>
        <div className="space-y-2">
          {pi.scenarios.map((s, i) => (
            <details
              key={i}
              className="group rounded-md border border-border/40 bg-background/30"
            >
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium hover:bg-muted/30">
                <span className="text-brand">{s.scenario}</span>
              </summary>
              <div className="border-t border-border/30 px-3 py-2 text-xs text-foreground/80">
                {s.response}
              </div>
            </details>
          ))}
        </div>

        <SubHeading>Long-term viability</SubHeading>
        <DefList
          items={[
            {
              label: "Type",
              value: <StatusPill value={pi.long_term_viability.type} tone={pi.long_term_viability.type === "forever" ? "positive" : "warning"} />,
            },
            { label: "For it to become forever", value: pi.long_term_viability.forever_change },
            { label: "For it to end", value: pi.long_term_viability.end_change },
          ]}
        />
      </div>
    </ReportSection>
  );
}

function RecommendationsSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const r = report.recommendations;
  return (
    <ReportSection
      id="recommendations"
      title="Personalized Recommendations"
      subtitle="What to keep doing, what to improve, and experiments to try"
      icon={<Lightbulb className="h-4 w-4" />}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border/40 bg-background/30 p-3">
            <div className="mb-2 text-xs font-semibold text-brand">
              For {personA}
            </div>
            <SubHeading>Keep doing</SubHeading>
            <ul className="space-y-1">
              {r.person_a.keep_doing.map((x, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-positive" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <SubHeading>Improve</SubHeading>
            <ul className="space-y-1">
              {r.person_a.improve.map((x, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <SubHeading>Experiment</SubHeading>
            <p className="rounded-md bg-brand/5 px-2 py-1.5 text-xs italic text-foreground/90">
              {r.person_a.experiment}
            </p>
          </div>
          <div className="rounded-md border border-border/40 bg-background/30 p-3">
            <div className="mb-2 text-xs font-semibold text-brand-accent">
              For {personB}
            </div>
            <SubHeading>Keep doing</SubHeading>
            <ul className="space-y-1">
              {r.person_b.keep_doing.map((x, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-positive" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <SubHeading>Improve</SubHeading>
            <ul className="space-y-1">
              {r.person_b.improve.map((x, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs">
                  <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-warning" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <SubHeading>Experiment</SubHeading>
            <p className="rounded-md bg-brand/5 px-2 py-1.5 text-xs italic text-foreground/90">
              {r.person_b.experiment}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-brand/30 bg-brand/5 p-3">
          <div className="mb-2 text-xs font-semibold text-brand">
            For both of you, together
          </div>
          <SubHeading>Rituals to consider</SubHeading>
          <ul className="space-y-1">
            {r.together.rituals.map((x, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs">
                <Calendar className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <SubHeading>Conversation experiments</SubHeading>
          <ul className="space-y-1">
            {r.together.conversations.map((x, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs">
                <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <SubHeading>A challenge to try together</SubHeading>
          <p className="rounded-md bg-background/50 px-2 py-1.5 text-xs italic text-foreground/90">
            {r.together.challenge}
          </p>
        </div>

        <SubHeading>If you want to strengthen this friendship</SubHeading>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm">
          {r.strengthen_steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </ReportSection>
  );
}

function LoveRomanceSection({
  report,
  personA,
  personB,
}: {
  report: AnalysisReport;
  personA: string;
  personB: string;
}) {
  const lr = report.love_romance;
  if (!lr) return null;

  // Human-readable labels for relationship types
  const typeLabels: Record<string, string> = {
    platonic_friends: "Platonic Friends",
    best_friends_with_tension: "Best Friends with Tension",
    situationship: "Situationship",
    dating: "Dating",
    established_couple: "Established Couple",
    exes_staying_in_touch: "Exes Staying in Touch",
    one_sided_crush_a_to_b: `One-Sided Crush (${personA} → ${personB})`,
    one_sided_crush_b_to_a: `One-Sided Crush (${personB} → ${personA})`,
    mutual_unspoken_crush: "Mutual Unspoken Crush",
    unclear: "Unclear / Ambiguous",
  };

  // Tone for the relationship type badge
  const romanticTypes = ["dating", "established_couple", "situationship", "mutual_unspoken_crush", "best_friends_with_tension"];
  const crushTypes = ["one_sided_crush_a_to_b", "one_sided_crush_b_to_a"];
  const typeTone: "positive" | "warning" | "concern" | "brand" | "neutral" =
    romanticTypes.includes(lr.relationship_type)
      ? "brand"
      : crushTypes.includes(lr.relationship_type)
        ? "warning"
        : lr.relationship_type === "unclear"
          ? "neutral"
          : "neutral";

  // Flirtation comparison data for chart
  const flirtData = [
    { label: personA.slice(0, 12), A: lr.flirtation_intensity?.A ?? 0, B: lr.flirtation_intensity?.B ?? 0 },
  ];

  return (
    <ReportSection
      id="love-romance"
      title="Love & Romance"
      subtitle="Romantic dimension — chemistry, flirtation, and couple potential"
      icon={<Heart className="h-4 w-4" />}
    >
      <div className="space-y-4">
        {/* Top: relationship type + chemistry score */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-background/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Relationship type
            </div>
            <div className="mt-1.5">
              <StatusPill
                value={typeLabels[lr.relationship_type] ?? lr.relationship_type}
                tone={typeTone}
              />
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Confidence: {lr.type_confidence ?? 0}%
            </div>
            <ScoreMeter
              value={lr.type_confidence ?? 0}
              max={100}
              tone="brand"
            />
          </div>
          <div className="rounded-lg border border-border/40 bg-background/40 p-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Chemistry score
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-brand">
                {lr.chemistry_score ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <ScoreMeter
              value={lr.chemistry_score ?? 0}
              max={100}
              tone={
                (lr.chemistry_score ?? 0) >= 70
                  ? "positive"
                  : (lr.chemistry_score ?? 0) >= 40
                    ? "warning"
                    : "neutral"
              }
            />
          </div>
        </div>

        {/* Type explanation */}
        <div>
          <SubHeading>Why this classification?</SubHeading>
          <p className="text-sm text-foreground/90">{lr.type_explanation}</p>
        </div>

        {/* Chemistry explanation */}
        <div>
          <SubHeading>Chemistry analysis</SubHeading>
          <p className="text-sm text-foreground/90">{lr.chemistry_explanation}</p>
        </div>

        {/* Signals */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-brand/30 bg-brand/5 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-brand">
              <Heart className="h-3.5 w-3.5" />
              Romantic signals ({lr.romantic_signals?.length ?? 0})
            </div>
            {lr.romantic_signals && lr.romantic_signals.length > 0 ? (
              <ul className="space-y-1">
                {lr.romantic_signals.map((s, i) => (
                  <li key={i} className="text-[11px] text-foreground/80">{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No clear romantic signals detected.
              </p>
            )}
          </div>
          <div className="rounded-md border border-neutral-soft bg-neutral-soft p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Platonic signals ({lr.platonic_signals?.length ?? 0})
            </div>
            {lr.platonic_signals && lr.platonic_signals.length > 0 ? (
              <ul className="space-y-1">
                {lr.platonic_signals.map((s, i) => (
                  <li key={i} className="text-[11px] text-foreground/80">{s}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No clear platonic signals detected.
              </p>
            )}
          </div>
        </div>

        {/* Flirtation */}
        <div>
          <SubHeading>Flirtation intensity</SubHeading>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border/40 bg-background/30 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium">{personA}</span>
                <span className="text-lg font-bold text-brand">
                  {lr.flirtation_intensity?.A ?? 0}<span className="text-xs text-muted-foreground">/10</span>
                </span>
              </div>
              <ScoreMeter
                value={lr.flirtation_intensity?.A ?? 0}
                tone={(lr.flirtation_intensity?.A ?? 0) >= 7 ? "positive" : (lr.flirtation_intensity?.A ?? 0) >= 4 ? "brand" : "neutral"}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                {lr.flirtation_style?.A ?? "—"}
              </p>
            </div>
            <div className="rounded-md border border-border/40 bg-background/30 p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium">{personB}</span>
                <span className="text-lg font-bold text-brand-accent">
                  {lr.flirtation_intensity?.B ?? 0}<span className="text-xs text-muted-foreground">/10</span>
                </span>
              </div>
              <ScoreMeter
                value={lr.flirtation_intensity?.B ?? 0}
                tone={(lr.flirtation_intensity?.B ?? 0) >= 7 ? "positive" : (lr.flirtation_intensity?.B ?? 0) >= 4 ? "brand" : "neutral"}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                {lr.flirtation_style?.B ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Terms of endearment + physical references */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <SubHeading>Terms of endearment</SubHeading>
            {lr.terms_of_endearment && lr.terms_of_endearment.length > 0 && lr.terms_of_endearment[0] !== "none observed" ? (
              <div className="flex flex-wrap gap-1.5">
                {lr.terms_of_endearment.map((t, i) => (
                  <StatusPill key={i} value={t} tone="brand" />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">None observed.</p>
            )}
          </div>
          <div>
            <SubHeading>Physical / romantic references</SubHeading>
            {lr.physical_romantic_references && lr.physical_romantic_references.length > 0 && lr.physical_romantic_references[0] !== "none observed" ? (
              <ul className="space-y-1">
                {lr.physical_romantic_references.map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs">
                    <Heart className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">None observed.</p>
            )}
          </div>
        </div>

        {/* Emotional intimacy */}
        <div>
          <SubHeading>Emotional intimacy level</SubHeading>
          <div className="mb-2">
            <StatusPill
              value={lr.emotional_intimacy_level?.replace(/_/g, " ") ?? "typical friendship"}
              tone={
                lr.emotional_intimacy_level === "romantic"
                  ? "brand"
                  : lr.emotional_intimacy_level === "high"
                    ? "positive"
                    : lr.emotional_intimacy_level === "elevated"
                      ? "warning"
                      : "neutral"
              }
            />
          </div>
          <p className="text-sm text-foreground/90">
            {lr.emotional_intimacy_evidence}
          </p>
        </div>

        {/* Jealousy + future references */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <SubHeading>Jealousy indicators</SubHeading>
            <DefList
              items={[
                {
                  label: "Present",
                  value: lr.jealousy_indicators?.present
                    ? <StatusPill value="Yes" tone="concern" />
                    : <StatusPill value="No" tone="positive" />,
                },
                { label: "Description", value: lr.jealousy_indicators?.description ?? "—" },
              ]}
            />
          </div>
          <div>
            <SubHeading>Shared-future references</SubHeading>
            <DefList
              items={[
                {
                  label: "Present",
                  value: lr.future_references?.present
                    ? <StatusPill value="Yes" tone="brand" />
                    : <StatusPill value="No" tone="neutral" />,
                },
                { label: "Description", value: lr.future_references?.description ?? "—" },
              ]}
            />
          </div>
        </div>

        {/* Couple potential */}
        <div className="rounded-md border border-border/40 bg-background/30 p-3">
          <SubHeading>
            {romanticTypes.includes(lr.relationship_type) && lr.relationship_type !== "best_friends_with_tension"
              ? "Couple strength"
              : "Couple potential"}
          </SubHeading>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand">
              {lr.couple_potential?.score ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <ScoreMeter
            value={lr.couple_potential?.score ?? 0}
            max={100}
            tone={(lr.couple_potential?.score ?? 0) >= 70 ? "positive" : (lr.couple_potential?.score ?? 0) >= 40 ? "warning" : "neutral"}
          />
          <p className="mt-2 text-sm text-foreground/90">
            {lr.couple_potential?.reasoning}
          </p>
        </div>

        {/* Notable moments */}
        {lr.notable_moments && lr.notable_moments.length > 0 && lr.notable_moments[0] !== "none observed" && (
          <div>
            <SubHeading>Notable romantic moments</SubHeading>
            <ul className="space-y-1.5">
              {lr.notable_moments.map((m, i) => (
                <li key={i} className="flex items-start gap-2 rounded-md border border-border/40 bg-background/30 p-2 text-xs">
                  <Heart className="mt-0.5 h-3 w-3 shrink-0 text-brand" />
                  <span className="italic text-foreground/90">{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Verdict */}
        <div className="rounded-md border border-brand/30 bg-brand/5 p-3 text-center">
          <div className="mb-1 text-[11px] uppercase tracking-wide text-brand">
            Verdict
          </div>
          <p className="text-sm font-medium italic text-foreground/90">
            &ldquo;{lr.verdict}&rdquo;
          </p>
        </div>
      </div>
    </ReportSection>
  );
}

function ClosingSection({ report }: { report: AnalysisReport }) {
  return (
    <ReportSection
      id="closing-thought"
      title="Closing thought"
      icon={<Sparkles className="h-4 w-4" />}
    >
      <p className="text-base italic text-foreground/90">
        &ldquo;{report.closing_thought}&rdquo;
      </p>
    </ReportSection>
  );
}
