/**
 * TypeScript types for the analysis report.
 * Mirrors the JSON schema requested in prompts.ts.
 */

export interface ArchetypeScore {
  name: string;
  score: number;
}

export interface ExecutiveSummary {
  health_score: number;
  health_justification: string;
  archetypes: ArchetypeScore[];
  strengths: string[];
  growth_areas: string[];
  surprising_finding: string;
  essence_sentence: string;
}

export interface PersonalityProfile {
  name: string;
  communication_dna: {
    message_length: string;
    message_length_consistency: string;
    response_speed: string;
    response_speed_variations: string;
    emoji_usage: string;
    emoji_types: string;
    language_style: string;
    verbal_tics: string;
    question_ratio: string;
    initiation_pattern: string;
  };
  personality_traits: {
    big_five: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    big_five_evidence: Record<string, string>;
    mbti_informed: {
      extraverted_vs_introverted: string;
      facts_vs_ideas: string;
      logical_vs_feeling: string;
      structured_vs_spontaneous: string;
    };
    attachment_style: string;
    attachment_evidence: string;
  };
  emotional_expression: {
    excitement_style: string;
    frustration_style: string;
    vulnerability_comfort: string;
    vulnerability_examples: string;
    response_to_others_vulnerability: string;
    expressive_topics: string[];
  };
  digital_signature: {
    most_active_time: string;
    what_time_suggests: string;
    weekend_vs_weekday: string;
    modes: string[];
    signature_moves: string[];
  };
}

export interface ReciprocityRow {
  behavior: string;
  person_a: string;
  person_b: string;
  balanced: boolean;
}

export interface GlueFactor {
  factor: string;
  strength: number;
}

export interface RelationshipDynamics {
  power_dynamics: {
    conversational_power: string;
    decision_making_lead: string;
    imbalance_present: boolean;
    imbalance_description: string;
    subject_changer: string;
    influence_lead: string;
  };
  interdependence: {
    need_vs_want: string;
    emotional_reliance: string;
    information_exclusivity: string;
    life_without_friendship: string;
    style: string;
  };
  reciprocity: ReciprocityRow[];
  reciprocity_note: string;
  glue_factors: GlueFactor[];
  glue_summary: string;
}

export interface CommunicationPatterns {
  flow_types: string[];
  flow_description: string;
  conflict_style: {
    person_a_style: string;
    person_b_style: string;
    apologizer_first: string;
    apology_genuineness: string;
    conflict_resolution: string;
    recurring_topics: string[];
    frequency: string;
    healthiness: string;
    description: string;
  };
  silence_analysis: {
    silence_meaning: string;
    comfortable_or_anxious: string;
    check_in_time: string;
    left_on_read: string;
  };
  digital_body_language: {
    ok_meanings: string;
    punctuation_patterns: string;
    capitalization_patterns: string;
    length_as_interest: string;
  };
}

export interface TopicDistribution {
  topic: string;
  percentage: number;
}

export interface TopicDepth {
  topic: string;
  level: string;
}

export interface TopicEcosystem {
  distribution: TopicDistribution[];
  distribution_note: string;
  depth: TopicDepth[];
  avoided_topics: string[];
  avoided_topics_note: string;
  niche_interests: string[];
  niche_interests_note: string;
}

export interface VulnerabilityMatrixRow {
  topic: string;
  person_a_comfort: string;
  person_b_comfort: string;
  shared_level: string;
}

export interface EmotionalIntelligence {
  detect_upset: number;
  respond_appropriately: number;
  advice_vs_listen: number;
  respect_boundaries: number;
  validate_feelings: number;
}

export interface EmotionalLandscape {
  valence_ratio: string;
  valence_shift: string;
  positive_triggers: string[];
  negative_triggers: string[];
  baseline: string;
  contagion: {
    a_down_b_response: string;
    b_down_a_response: string;
    a_effectiveness: string;
    b_effectiveness: string;
  };
  vulnerability_matrix: VulnerabilityMatrixRow[];
  emotional_intelligence: {
    A: EmotionalIntelligence;
    B: EmotionalIntelligence;
  };
}

export interface HumorStyle {
  self_deprecating: number;
  sarcasm_irony: number;
  dark_humor: number;
  wordplay_puns: number;
  observational: number;
  absurd_random: number;
  reference_humor: number;
  roasting_banter: number;
}

export interface HumorAnalysis {
  A: HumorStyle;
  B: HumorStyle;
  dark_humor_boundaries: string;
  inside_jokes: {
    estimated_count: string;
    longevity: string;
    classic_callbacks: string[];
    outsider_lost: boolean;
  };
  compatibility: {
    shared_funny: string;
    engagement: string;
    bonding_mechanism: string;
    mismatches: string;
  };
}

export interface HealthAssessment {
  green_flags: string[];
  yellow_flags: string[];
  red_flags: string[];
  overall_score: number;
  primary_strength: string;
  primary_risk: string;
  comparison_to_average: string;
  assessment: string;
}

export interface TemporalPatterns {
  daily_rhythm: {
    peak_hours_A: string;
    peak_hours_B: string;
    sync: string;
    morning_vs_night: string;
    effect_on_connection: string;
  };
  weekly_rhythm: {
    busier_days: string;
    end_of_week_pattern: string;
    beginning_of_week_pattern: string;
  };
  seasonal_patterns: string;
  evolution: {
    month_1: string;
    month_6: string;
    month_12: string;
    trajectory: string;
    shifts: string;
  };
}

export interface ComparativeAnalysis {
  similarity: {
    communication_overlap: number;
    interest_overlap: number;
    personality_overlap: number;
    value_alignment: number;
    overall: string;
  };
  complementarity: string[];
  friction_points: string[];
  puzzle_factor: string;
}

export interface ScenarioResponse {
  scenario: string;
  response: string;
}

export interface PredictiveInsights {
  trajectory_6_12_months: {
    prediction: string;
    challenge_areas: string[];
    positive_developments: string[];
    confidence: string;
  };
  scenarios: ScenarioResponse[];
  long_term_viability: {
    type: string;
    forever_change: string;
    end_change: string;
  };
}

export interface Recommendations {
  person_a: {
    keep_doing: string[];
    improve: string[];
    experiment: string;
  };
  person_b: {
    keep_doing: string[];
    improve: string[];
    experiment: string;
  };
  together: {
    rituals: string[];
    conversations: string[];
    challenge: string;
  };
  strengthen_steps: string[];
}

export interface LoveRomanceSection {
  /** The model's read of the relationship type */
  relationship_type:
    | "platonic_friends"
    | "best_friends_with_tension"
    | "situationship"
    | "dating"
    | "established_couple"
    | "exes_staying_in_touch"
    | "one_sided_crush_a_to_b"
    | "one_sided_crush_b_to_a"
    | "mutual_unspoken_crush"
    | "unclear";
  /** 0-100 confidence in that classification */
  type_confidence: number;
  /** Human-readable explanation of why the model classified it this way */
  type_explanation: string;

  /** Romantic chemistry score 0-100 */
  chemistry_score: number;
  chemistry_explanation: string;

  /** Romantic signals detected in the chat (or empty if none) */
  romantic_signals: string[];
  /** Platonic signals detected (signals that argue AGAINST romance) */
  platonic_signals: string[];

  /** flirtation_intensity 0-10 for each person */
  flirtation_intensity: {
    A: number;
    B: number;
  };
  /** How each person flirts (style description) */
  flirtation_style: {
    A: string;
    B: string;
  };

  /** Terms of endearment / pet names used (or "none observed") */
  terms_of_endearment: string[];
  /** Physical/romantic references (or "none observed") */
  physical_romantic_references: string[];

  /** Emotional intimacy level beyond normal friendship */
  emotional_intimacy_level: "typical_friendship" | "elevated" | "high" | "romantic";
  emotional_intimacy_evidence: string;

  /** Jealousy or possessiveness indicators */
  jealousy_indicators: {
    present: boolean;
    description: string;
  };

  /** Future together — does the chat reference a shared future romantically? */
  future_references: {
    present: boolean;
    description: string;
  };

  /** If they are NOT a couple: would they work as one? */
  couple_potential: {
    score: number; // 0-100
    reasoning: string;
  };

  /** Memorable romantic/chemistry moments from the chat (or "none observed") */
  notable_moments: string[];

  /** Final verdict — a punchy one-liner */
  verdict: string;
}

export interface AnalysisReport {
  executive_summary: ExecutiveSummary;
  personality_profiles: {
    A: PersonalityProfile;
    B: PersonalityProfile;
  };
  relationship_dynamics: RelationshipDynamics;
  communication_patterns: CommunicationPatterns;
  topic_ecosystem: TopicEcosystem;
  emotional_landscape: EmotionalLandscape;
  humor_analysis: HumorAnalysis;
  health_assessment: HealthAssessment;
  temporal_patterns: TemporalPatterns;
  comparative_analysis: ComparativeAnalysis;
  predictive_insights: PredictiveInsights;
  recommendations: Recommendations;
  /** Love & Romance section — added to handle couples / potential couples */
  love_romance: LoveRomanceSection;
  closing_thought: string;
}

// Helper: metadata attached to the report
export interface ReportMetadata {
  personA: string;
  personB: string;
  timeframe: string;
  totalMessages: number;
  dateRange: { start: string; end: string };
  generatedAt: string;
  provider: string;
  fastModel: string;
  capableModel: string;
}
