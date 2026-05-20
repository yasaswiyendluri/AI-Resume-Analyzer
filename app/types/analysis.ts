export interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  wordCount: number;
}

export interface AnalysisSession {
  fileName: string;
  jobTitle: string;
  jobDescription: string;
  analysis: AnalysisResult;
  analyzedAt: string;
}
