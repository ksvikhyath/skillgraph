"use client";

import { useState } from "react";
import SkillGraphMark from "@/components/SkillGraphMark";
import UploadForm from "@/components/UploadForm";
import ResultsView from "@/components/ResultsView";
import RoadmapView from "@/components/RoadmapView";
import { AnalysisResult, RoadmapPlan } from "@/types";

type Step = "input" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapPlan | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  async function handleAnalyze(data: {
    resumeText: string;
    jobText: string;
    githubUsername: string;
    targetRole: string;
  }) {
    setAnalyzing(true);
    setError(null);
    setTargetRole(data.targetRole);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed.");
      setResult(json);
      setRoadmap(null);
      setStep("results");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleRoadmap() {
    if (!result) return;
    setRoadmapLoading(true);
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gaps: result.gaps, targetRole }),
      });
      const json = await res.json();
      if (res.ok) setRoadmap(json);
    } finally {
      setRoadmapLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      {step === "input" && (
        <>
          <header className="mb-16">
            <p className="mb-4 font-mono text-xs uppercase tracking-wider text-amber">SkillGraph</p>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Skills you can prove beat skills you can list.
            </h1>
            <p className="mt-4 max-w-xl text-fog">
              Paste your resume and a job post. SkillGraph checks what you claim against what your
              GitHub actually shows, then tells you exactly what to build next.
            </p>
            <div className="mt-10">
              <SkillGraphMark />
            </div>
          </header>
          <UploadForm onSubmit={handleAnalyze} submitting={analyzing} error={error} />
        </>
      )}

      {step === "results" && result && (
        <>
          <button
            onClick={() => setStep("input")}
            className="focus-ring mb-8 font-mono text-xs text-fog hover:text-paper"
          >
            ← Run another match
          </button>
          <ResultsView
            result={result}
            onBuildRoadmap={handleRoadmap}
            roadmapLoading={roadmapLoading}
            roadmapReady={Boolean(roadmap)}
          />
          {roadmap && <RoadmapView plan={roadmap} />}
        </>
      )}

      <footer className="mt-24 border-t border-line pt-6 text-xs text-fog">
        Built to show your work, not just describe it.
      </footer>
    </main>
  );
}
