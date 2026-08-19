import { resolveSkill, SkillDef } from "./skills";

export interface RepoEvidence {
  name: string;
  languages: string[];
  hasDocker: boolean;
  hasCI: boolean;
  hasTests: boolean;
}

export interface GithubEvidence {
  username: string;
  reposScanned: number;
  skillHits: Map<string, number>; // canonical skill name -> number of repos it appeared in
  repos: RepoEvidence[];
  error?: string;
}

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJson(res: Response) {
  if (!res.ok) return null;
  return res.json();
}

/** Pull public repo evidence for a GitHub username: languages + Docker/CI/test signals. */
export async function fetchGithubEvidence(username: string): Promise<GithubEvidence> {
  const skillHits = new Map<string, number>();
  const repos: RepoEvidence[] = [];

  const reposRes = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`,
    { headers: authHeaders() }
  );

  if (!reposRes.ok) {
    return {
      username,
      reposScanned: 0,
      skillHits,
      repos,
      error:
        reposRes.status === 404
          ? "GitHub user not found."
          : "GitHub API rate limit reached — evidence check skipped.",
    };
  }

  const repoList: any[] = (await reposRes.json()) ?? [];
  const topRepos = repoList.filter((r) => !r.fork).slice(0, 5);

  for (const repo of topRepos) {
    const evidence: RepoEvidence = {
      name: repo.name,
      languages: [],
      hasDocker: false,
      hasCI: false,
      hasTests: false,
    };

    const langData = await safeJson(
      await fetch(repo.languages_url, { headers: authHeaders() })
    );
    const languageNames: string[] = langData ? Object.keys(langData) : [];
    for (const lang of languageNames) {
      const resolved: SkillDef | null = resolveSkill(lang);
      if (resolved) {
        evidence.languages.push(resolved.name);
        skillHits.set(resolved.name, (skillHits.get(resolved.name) ?? 0) + 1);
      }
    }

    const contents = await safeJson(
      await fetch(`https://api.github.com/repos/${repo.full_name}/contents`, {
        headers: authHeaders(),
      })
    );
    const fileNames: string[] = Array.isArray(contents)
      ? contents.map((f: any) => (f.name as string).toLowerCase())
      : [];

    evidence.hasDocker = fileNames.some(
      (f) => f === "dockerfile" || f === "docker-compose.yml" || f === "docker-compose.yaml"
    );
    evidence.hasCI = fileNames.includes(".github") || fileNames.includes(".gitlab-ci.yml");
    evidence.hasTests = fileNames.some((f) => f.includes("test") || f === "pytest.ini" || f === "jest.config.js");

    if (evidence.hasDocker) {
      skillHits.set("Docker", (skillHits.get("Docker") ?? 0) + 1);
    }
    if (evidence.hasCI) {
      skillHits.set("CI/CD", (skillHits.get("CI/CD") ?? 0) + 1);
    }
    if (evidence.hasTests) {
      skillHits.set("Testing", (skillHits.get("Testing") ?? 0) + 1);
    }

    repos.push(evidence);
  }

  return { username, reposScanned: topRepos.length, skillHits, repos };
}
