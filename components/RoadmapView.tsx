"use client";

import { RoadmapPlan } from "@/types";

export default function RoadmapView({ plan }: { plan: RoadmapPlan }) {
  return (
    <section className="space-y-6 border-t border-line pt-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-fog">Recommended project</p>
        <h2 className="font-display text-2xl font-bold">{plan.projectTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm text-fog">{plan.projectDescription}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {plan.skillsGained.map((s) => (
          <span
            key={s}
            className="rounded-full border border-amber/40 px-3 py-1 font-mono text-xs text-amber"
          >
            {s}
          </span>
        ))}
      </div>

      <div>
        <p className="mb-3 font-mono text-xs uppercase tracking-wider text-fog">Week one</p>
        <ol className="space-y-2">
          {plan.week.map((d) => (
            <li key={d.day} className="flex items-center gap-4 rounded-md border border-line bg-panel px-4 py-3">
              <span className="font-mono text-xs text-fog">Day {d.day}</span>
              <span className="text-sm text-paper">{d.focus}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-sm text-fog">
        Ship it, push it to GitHub, and run this analysis again — that's what moves the number.
      </p>
    </section>
  );
}
