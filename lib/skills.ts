// A curated taxonomy of skills SkillGraph recognizes, grouped by category.
// This is intentionally a flat, editable list rather than a black-box model —
// add a skill here and every part of the app (extraction, matching, evidence,
// roadmap) picks it up.

export type SkillCategory =
  | "language"
  | "framework"
  | "database"
  | "cloud"
  | "tool"
  | "concept";

export interface SkillDef {
  name: string; // canonical display name
  category: SkillCategory;
  aliases: string[]; // lowercase alternate spellings/abbreviations
}

export const SKILLS: SkillDef[] = [
  { name: "Python", category: "language", aliases: ["python", "py"] },
  { name: "JavaScript", category: "language", aliases: ["javascript", "js"] },
  { name: "TypeScript", category: "language", aliases: ["typescript", "ts"] },
  { name: "Java", category: "language", aliases: ["java"] },
  { name: "C++", category: "language", aliases: ["c++", "cpp"] },
  { name: "C", category: "language", aliases: ["c lang", "c programming"] },
  { name: "Go", category: "language", aliases: ["golang", "go"] },
  { name: "Rust", category: "language", aliases: ["rust"] },
  { name: "SQL", category: "language", aliases: ["sql"] },

  { name: "React", category: "framework", aliases: ["react", "react.js", "reactjs"] },
  { name: "Next.js", category: "framework", aliases: ["next.js", "nextjs", "next js"] },
  { name: "Node.js", category: "framework", aliases: ["node.js", "nodejs", "node"] },
  { name: "Express", category: "framework", aliases: ["express", "express.js"] },
  { name: "Django", category: "framework", aliases: ["django"] },
  { name: "FastAPI", category: "framework", aliases: ["fastapi", "fast api"] },
  { name: "Flask", category: "framework", aliases: ["flask"] },
  { name: "Spring Boot", category: "framework", aliases: ["spring boot", "spring"] },

  { name: "PostgreSQL", category: "database", aliases: ["postgresql", "postgres", "psql"] },
  { name: "MySQL", category: "database", aliases: ["mysql"] },
  { name: "MongoDB", category: "database", aliases: ["mongodb", "mongo"] },
  { name: "Redis", category: "database", aliases: ["redis"] },
  { name: "SQLite", category: "database", aliases: ["sqlite"] },

  { name: "AWS", category: "cloud", aliases: ["aws", "amazon web services"] },
  { name: "Azure", category: "cloud", aliases: ["azure"] },
  { name: "GCP", category: "cloud", aliases: ["gcp", "google cloud"] },
  { name: "Kafka", category: "cloud", aliases: ["kafka", "apache kafka"] },
  { name: "Kubernetes", category: "cloud", aliases: ["kubernetes", "k8s"] },

  { name: "Docker", category: "tool", aliases: ["docker", "dockerized", "containerization"] },
  { name: "Git", category: "tool", aliases: ["git"] },
  { name: "CI/CD", category: "tool", aliases: ["ci/cd", "ci-cd", "github actions", "jenkins", "continuous integration"] },
  { name: "Testing", category: "tool", aliases: ["testing", "unit testing", "pytest", "jest"] },

  { name: "REST APIs", category: "concept", aliases: ["rest api", "rest apis", "restful", "rest"] },
  { name: "OOP", category: "concept", aliases: ["oop", "object oriented programming", "object-oriented"] },
  { name: "Machine Learning", category: "concept", aliases: ["machine learning", "ml"] },
  { name: "DSA", category: "concept", aliases: ["dsa", "data structures", "algorithms", "data structures and algorithms"] },
  { name: "System Design", category: "concept", aliases: ["system design"] },
  { name: "NLP", category: "concept", aliases: ["nlp", "natural language processing"] },
];

const ALIAS_LOOKUP: Map<string, SkillDef> = new Map();
for (const skill of SKILLS) {
  ALIAS_LOOKUP.set(skill.name.toLowerCase(), skill);
  for (const alias of skill.aliases) ALIAS_LOOKUP.set(alias, skill);
}

/** Resolve a raw string (from a resume, JD, or GitHub language) to a known skill, if any. */
export function resolveSkill(raw: string): SkillDef | null {
  const key = raw.trim().toLowerCase();
  return ALIAS_LOOKUP.get(key) ?? null;
}

/**
 * Scan free text for every known skill mentioned. Returns them ordered by
 * first appearance in the text, since where a skill is mentioned (e.g. near
 * the top of a job post's requirements) is a reasonable proxy for priority.
 */
export function extractSkillsFromText(text: string): SkillDef[] {
  const lower = text.toLowerCase();
  const hits: { skill: SkillDef; index: number }[] = [];

  for (const skill of SKILLS) {
    const candidates = [skill.name.toLowerCase(), ...skill.aliases];
    let bestIndex = -1;
    for (const c of candidates) {
      // escape regex special chars (relevant for "C++")
      const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
      const match = pattern.exec(lower);
      if (match && (bestIndex === -1 || match.index < bestIndex)) {
        bestIndex = match.index;
      }
    }
    if (bestIndex !== -1) hits.push({ skill, index: bestIndex });
  }

  hits.sort((a, b) => a.index - b.index);
  return hits.map((h) => h.skill);
}
