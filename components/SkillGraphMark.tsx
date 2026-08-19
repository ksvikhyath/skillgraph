"use client";

// The signature element: a real dependency chain rendered as a small graph,
// not a decorative abstraction. Node positions are fixed and hand-placed.

const nodes = [
  { id: "python", label: "Python", x: 40, y: 40, tier: 0 },
  { id: "fastapi", label: "FastAPI", x: 220, y: 20, tier: 1 },
  { id: "django", label: "Django", x: 220, y: 90, tier: 1 },
  { id: "postgres", label: "PostgreSQL", x: 420, y: 20, tier: 2 },
  { id: "docker", label: "Docker", x: 420, y: 90, tier: 2 },
  { id: "aws", label: "AWS", x: 610, y: 55, tier: 3, muted: true },
];

const edges = [
  ["python", "fastapi"],
  ["python", "django"],
  ["fastapi", "postgres"],
  ["fastapi", "docker"],
  ["django", "docker"],
  ["docker", "aws"],
];

export default function SkillGraphMark() {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox="0 0 660 130"
      className="w-full max-w-xl"
      role="img"
      aria-label="Skill dependency graph: Python leads to FastAPI and Django, which lead to PostgreSQL and Docker, which leads to AWS"
    >
      {edges.map(([from, to], i) => {
        const a = byId[from];
        const b = byId[to];
        return (
          <line
            key={i}
            x1={a.x + 6}
            y1={a.y + 10}
            x2={b.x - 6}
            y2={b.y + 10}
            stroke="#22303F"
            strokeWidth="1.5"
          />
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x - 6}
            y={n.y}
            width={n.label.length * 7.2 + 12}
            height={20}
            rx={3}
            fill={n.muted ? "#111823" : "#0B0F14"}
            stroke={n.muted ? "#22303F" : "#E8A33D"}
            strokeWidth={n.muted ? 1 : 1.5}
            strokeDasharray={n.muted ? "3 3" : undefined}
          />
          <text
            x={n.x - 6 + (n.label.length * 7.2 + 12) / 2}
            y={n.y + 14}
            textAnchor="middle"
            className="font-mono"
            fontSize="11"
            fill={n.muted ? "#8CA0B3" : "#E9EEF2"}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
