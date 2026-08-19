import { NextRequest, NextResponse } from "next/server";
import { extractSkillsFromText } from "@/lib/skills";
import { fetchGithubEvidence } from "@/lib/github";
import { buildCandidateProfile, matchAgainstJob, computeGaps, computeATS } from "@/lib/scoring";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const resumeText: string = (body.resumeText ?? "").toString();
    const jobText: string = (body.jobText ?? "").toString();
    const githubUsername: string = (body.githubUsername ?? "").toString().trim();

    if (!resumeText.trim() || !jobText.trim()) {
      return NextResponse.json(
        { error: "Both resume text and a job description are required." },
        { status: 400 }
      );
    }

    const resumeSkills = extractSkillsFromText(resumeText);
    const jobSkills = extractSkillsFromText(jobText);

    const github = githubUsername ? await fetchGithubEvidence(githubUsername) : null;

    const candidate = buildCandidateProfile(resumeSkills, github);
    const { rows, matchPercent } = matchAgainstJob(jobSkills, candidate);
    const gaps = computeGaps(rows);
    const ats = computeATS(resumeText, jobText, jobSkills);

    return NextResponse.json({
      candidate,
      matchRows: rows,
      matchPercent,
      gaps,
      ats,
      github: github
        ? {
            username: github.username,
            reposScanned: github.reposScanned,
            error: github.error ?? null,
            repos: github.repos,
          }
        : null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed. Check your input and try again." }, { status: 500 });
  }
}
