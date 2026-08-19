import { SkillDef } from "./skills";
import { GithubEvidence } from "./github";

export interface CandidateSkill {
  name: string;
  category: string;
  confidence: number; // 0-100
  confidenceLabel: "High" | "Moderate" | "Low";
  evidence: string;
}

export interface MatchRow {
  requirement: string;
  category: string;
  weight: number; // 1 = highest priority (mentioned first in JD)
  status: "Strong" | "Moderate" | "Missing";
  evidence: string;
}

export interface GapItem {
  skill: string;
  category: string;
  impact: number; // 0-100
  impactLabel: "High impact" | "Medium impact" | "Low impact";
  missing: boolean; // true = not present at all; false = claimed but unverified
}

export interface ATSResult {
  overall: number;
  keywordPct: number;
  formattingPct: number;
  missingKeywords: string[];
  note: string;
}

/** Build the candidate's skill profile from resume claims + GitHub evidence. */
export function buildCandidateProfile(
  resumeSkills: SkillDef[],
  github: GithubEvidence | null
): CandidateSkill[] {
  return resumeSkills.map((skill) => {
    const repoHits = github?.skillHits.get(skill.name) ?? 0;
    let confidence = 55; // resume-only baseline: claimed but unverified
    let evidence = "Listed on resume, no GitHub evidence found.";

    if (github && !github.error) {
      if (repoHits >= 2) {
        confidence = 90;
        evidence = `Backed by ${repoHits} of your recent repos.`;
      } else if (repoHits === 1) {
        confidence = 72;
        evidence = "Backed by 1 recent repo.";
      } else {
        confidence = 35;
        evidence = "Listed on resume, not visible in recent public repos.";
      }
    }

    return {
      name: skill.name,
      category: skill.category,
      confidence,
      confidenceLabel: confidence >= 75 ? "High" : confidence >= 50 ? "Moderate" : "Low",
      evidence,
    };
  });
}

/** Compare candidate skills against job requirements extracted from the JD. */
export function matchAgainstJob(
  jobSkills: SkillDef[],
  candidate: CandidateSkill[]
): { rows: MatchRow[]; matchPercent: number } {
  const byName = new Map(candidate.map((c) => [c.name, c]));
  const rows: MatchRow[] = jobSkills.map((req, i) => {
    const found = byName.get(req.name);
    const weight = jobSkills.length - i; // earlier requirements weigh more
    if (!found) {
      return {
        requirement: req.name,
        category: req.category,
        weight,
        status: "Missing",
        evidence: "Not found on resume or GitHub.",
      };
    }
    return {
      requirement: req.name,
      category: req.category,
      weight,
      status: found.confidence >= 70 ? "Strong" : "Moderate",
      evidence: found.evidence,
    };
  });

  if (jobSkills.length === 0) {
    return { rows, matchPercent: 0 };
  }

  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
  const earned = rows.reduce((s, r) => {
    const factor = r.status === "Strong" ? 1 : r.status === "Moderate" ? 0.6 : 0;
    return s + r.weight * factor;
  }, 0);

  return { rows, matchPercent: Math.round((earned / totalWeight) * 100) };
}

/** Rank missing/weak requirements by how much closing them would move the match score. */
export function computeGaps(rows: MatchRow[]): GapItem[] {
  const totalWeight = rows.reduce((s, r) => s + r.weight, 0) || 1;
  return rows
    .filter((r) => r.status !== "Strong")
    .map((r) => {
      const deficit = r.status === "Missing" ? 1 : 0.4;
      const impact = Math.round((r.weight / totalWeight) * deficit * 100);
      return {
        skill: r.requirement,
        category: r.category,
        impact,
        impactLabel: (impact >= 12 ? "High impact" : impact >= 6 ? "Medium impact" : "Low impact") as GapItem["impactLabel"],
        missing: r.status === "Missing",
      };
    })
    .sort((a, b) => b.impact - a.impact);
}

/** Simple, explainable ATS-style keyword coverage check. */
export function computeATS(resumeText: string, jdText: string, jobSkills: SkillDef[]): ATSResult {
  const resumeLower = resumeText.toLowerCase();
  const missing = jobSkills.filter((s) => {
    const allForms = [s.name.toLowerCase(), ...s.aliases];
    return !allForms.some((f) => resumeLower.includes(f));
  });

  const keywordPct = jobSkills.length
    ? Math.round(((jobSkills.length - missing.length) / jobSkills.length) * 100)
    : 100;

  const sections = ["experience", "education", "projects", "skills"];
  const sectionsFound = sections.filter((s) => resumeLower.includes(s)).length;
  const formattingPct = Math.round((sectionsFound / sections.length) * 100);

  const overall = Math.round(keywordPct * 0.7 + formattingPct * 0.3);

  return {
    overall,
    keywordPct,
    formattingPct,
    missingKeywords: missing.map((s) => s.name),
    note:
      missing.length === 0
        ? "Every requirement in the job post has matching evidence on your resume."
        : `${missing.map((s) => s.name).join(", ")} appear in the job post but aren't supported by evidence in your resume.`,
  };
}
