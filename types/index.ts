export interface CandidateSkill {
  name: string;
  category: string;
  confidence: number;
  confidenceLabel: "High" | "Moderate" | "Low";
  evidence: string;
}

export interface MatchRow {
  requirement: string;
  category: string;
  weight: number;
  status: "Strong" | "Moderate" | "Missing";
  evidence: string;
}

export interface GapItem {
  skill: string;
  category: string;
  impact: number;
  impactLabel: "High impact" | "Medium impact" | "Low impact";
}

export interface ATSResult {
  overall: number;
  keywordPct: number;
  formattingPct: number;
  missingKeywords: string[];
  note: string;
}

export interface RepoEvidence {
  name: string;
  languages: string[];
  hasDocker: boolean;
  hasCI: boolean;
  hasTests: boolean;
}

export interface GithubSummary {
  username: string;
  reposScanned: number;
  error: string | null;
  repos: RepoEvidence[];
}

export interface AnalysisResult {
  candidate: CandidateSkill[];
  matchRows: MatchRow[];
  matchPercent: number;
  gaps: GapItem[];
  ats: ATSResult;
  github: GithubSummary | null;
}

export interface RoadmapPlan {
  targetSkills: string[];
  projectTitle: string;
  projectDescription: string;
  skillsGained: string[];
  week: { day: number; focus: string }[];
}
