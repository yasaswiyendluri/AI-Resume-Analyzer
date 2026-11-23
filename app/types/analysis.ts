export type CategoryId = "keywords" | "impact" | "structure" | "readability";

export interface CategoryScore {
  id: CategoryId;
  label: string;
  score: number;
  /** Weight (0–1) of this category in the overall score. */
  weight: number;
  summary: string;
}

export type Priority = "high" | "medium" | "low";

export interface Insight {
  category: CategoryId;
  text: string;
  priority: Priority;
}

export interface KeywordHit {
  label: string;
  kind: "hard" | "soft" | "term";
}

export interface SectionCheck {
  id: string;
  label: string;
  found: boolean;
}

export interface ContactCheck {
  email: boolean;
  phone: boolean;
  linkedin: boolean;
  portfolio: boolean;
}

export interface ResumeStats {
  wordCount: number;
  bulletCount: number;
  quantifiedBullets: number;
  actionVerbBullets: number;
  longBullets: number;
  pronounCount: number;
  weakPhrases: string[];
}

export interface AnalysisResult {
  version: 2;
  score: number;
  categories: CategoryScore[];
  strengths: Insight[];
  improvements: Insight[];
  matchedKeywords: KeywordHit[];
  missingKeywords: KeywordHit[];
  sections: SectionCheck[];
  contact: ContactCheck;
  stats: ResumeStats;
}

export interface AiReview {
  model: string;
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  bulletRewrites: { original: string; improved: string }[];
  tailoredSummary: string;
  generatedAt: string;
}

export interface AnalysisSession {
  id: string;
  fileName: string;
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  analysis: AnalysisResult;
  analyzedAt: string;
  aiReview?: AiReview;
}
