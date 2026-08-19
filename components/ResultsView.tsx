"use client";

import { AnalysisResult } from "@/types";

function matchTagline(pct: number): string {
  if (pct >= 85) return "You're close. Polish the gaps below and apply.";
  if (pct >= 60) return "A real foundation. A few targeted skills close most of the gap.";
  if (pct >= 35) return "Early stage for this role. The roadmap below is the shortest path.";
  return "This role is a stretch today. That's useful to know before you apply, not after.";
}

function statusColor(status: string) {
  if (status === "Strong") return "text-signal";
  if (status === "Moderate") return "text-amber";
  return "text-rose";
}

export default function ResultsView({
  result,
  onBuildRoadmap,
  roadmapLoading,
  roadmapReady,
}: {
  result: AnalysisResult;
  onBuildRoadmap: () => void;
  roadmapLoading: boolean;
  roadmapReady: boolean;
}) {
  const { candidate, matchRows, matchPercent, gaps, ats, github } = result;

  return (
    <div className="space-y-12">
      {/* Match header */}
      <section className="flex flex-col items-start gap-4 border-b border-line pb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-fog">Match score</p>
          <p className="font-display text-6xl font-bold text-paper">{matchPercent}%</p>
          <p className="mt-1 max-w-md text-sm text-fog">{matchTagline(matchPercent)}</p>
        </div>
        <div className="w-full max-w-xs">
          <div className="h-2 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-amber transition-all"
              style={{ width: `${matchPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Candidate skill evidence */}
      <section>
        <h2 className="mb-1 font-display text-xl font-medium">Skill evidence</h2>
        <p className="mb-5 text-sm text-fog">
          What you claim, weighed against what your GitHub actually shows.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {candidate.map((s) => (
            <div key={s.name} className="rounded-md border border-line bg-panel p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-sm text-paper">{s.name}</span>
                <span
                  className={`font-mono text-xs ${
                    s.confidenceLabel === "High"
                      ? "text-signal"
                      : s.confidenceLabel === "Moderate"
                      ? "text-amber"
                      : "text-rose"
                  }`}
                >
                  {s.confidenceLabel}
                </span>
              </div>
              <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-fog"
                  style={{ width: `${s.confidence}%` }}
                />
              </div>
              <p className="text-xs text-fog">{s.evidence}</p>
            </div>
          ))}
          {candidate.length === 0 && (
            <p className="text-sm text-fog">
              None of the skills we track were detected in your resume text.
            </p>
          )}
        </div>
      </section>

      {/* Match table */}
      <section>
        <h2 className="mb-1 font-display text-xl font-medium">Requirement by requirement</h2>
        <p className="mb-5 text-sm text-fog">Ordered the way the job post prioritized them.</p>
        <div className="overflow-hidden rounded-md border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-panel font-mono text-xs uppercase tracking-wider text-fog">
              <tr>
                <th className="px-4 py-3">Requirement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {matchRows.map((r) => (
                <tr key={r.requirement} className="border-t border-line">
                  <td className="px-4 py-3 font-mono">{r.requirement}</td>
                  <td className={`px-4 py-3 font-medium ${statusColor(r.status)}`}>{r.status}</td>
                  <td className="px-4 py-3 text-fog">{r.evidence}</td>
                </tr>
              ))}
              {matchRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-fog">
                    No recognizable requirements found in that job post.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gap analysis */}
      {gaps.length > 0 && (
        <section>
          <h2 className="mb-1 font-display text-xl font-medium">Highest-impact gaps</h2>
          <p className="mb-5 text-sm text-fog">
            Closing these moves the match score the most — not just what's missing, but what matters.
          </p>
          <div className="space-y-3">
            {gaps.slice(0, 6).map((g) => (
              <div key={g.skill} className="flex items-center gap-4">
                <span className="w-32 shrink-0 font-mono text-sm">{g.skill}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full ${
                      g.impactLabel === "High impact" ? "bg-rose" : "bg-amber"
                    }`}
                    style={{ width: `${Math.max(g.impact * 4, 6)}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-xs text-fog">{g.impactLabel}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ATS panel */}
      <section>
        <h2 className="mb-1 font-display text-xl font-medium">ATS compatibility</h2>
        <p className="mb-5 text-sm text-fog">A rough read on how a keyword-scanning system sees your resume.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-line bg-panel p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-fog">Overall</p>
            <p className="font-display text-3xl font-bold">{ats.overall}%</p>
          </div>
          <div className="rounded-md border border-line bg-panel p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-fog">Keyword coverage</p>
            <p className="font-display text-3xl font-bold">{ats.keywordPct}%</p>
          </div>
          <div className="rounded-md border border-line bg-panel p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-fog">Structure</p>
            <p className="font-display text-3xl font-bold">{ats.formattingPct}%</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-fog">{ats.note}</p>
      </section>

      {/* GitHub evidence */}
      {github && (
        <section>
          <h2 className="mb-1 font-display text-xl font-medium">GitHub evidence</h2>
          {github.error ? (
            <p className="text-sm text-rose">{github.error}</p>
          ) : (
            <>
              <p className="mb-5 text-sm text-fog">
                Scanned {github.reposScanned} recent public repos from @{github.username}.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {github.repos.map((r) => (
                  <div key={r.name} className="rounded-md border border-line bg-panel p-4">
                    <p className="mb-2 font-mono text-sm">{r.name}</p>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {r.languages.map((l) => (
                        <span key={l} className="rounded border border-line px-2 py-0.5 text-fog">
                          {l}
                        </span>
                      ))}
                      {r.hasDocker && (
                        <span className="rounded border border-signal/40 px-2 py-0.5 text-signal">
                          Docker
                        </span>
                      )}
                      {r.hasCI && (
                        <span className="rounded border border-signal/40 px-2 py-0.5 text-signal">
                          CI
                        </span>
                      )}
                      {r.hasTests && (
                        <span className="rounded border border-signal/40 px-2 py-0.5 text-signal">
                          Tests
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Roadmap CTA */}
      {gaps.length > 0 && !roadmapReady && (
        <section className="rounded-md border border-line bg-panel p-6">
          <h2 className="font-display text-lg font-medium">What should you build next?</h2>
          <p className="mt-1 mb-4 text-sm text-fog">
            One project, sized to close your highest-impact gaps — not a list of things to go read about.
          </p>
          <button
            onClick={onBuildRoadmap}
            disabled={roadmapLoading}
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-amber px-6 py-3 font-mono text-sm font-medium text-ink transition hover:brightness-110 disabled:opacity-40"
          >
            {roadmapLoading ? "Sketching a project…" : "Build my roadmap"}
          </button>
        </section>
      )}
    </div>
  );
}
