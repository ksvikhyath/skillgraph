import { GapItem } from "./scoring";
import { askLLM, isLLMAvailable } from "./llm";

export interface RoadmapDay {
  day: number;
  focus: string;
}

export interface RoadmapPlan {
  targetSkills: string[];
  projectTitle: string;
  projectDescription: string;
  skillsGained: string[];
  week: RoadmapDay[];
}

// Deterministic project templates keyed by skill. Combining 2-3 gap skills
// into one project mirrors how real portfolio projects demonstrate several
// skills at once, instead of one throwaway exercise per skill.
const PROJECT_TEMPLATES: Record<string, { title: string; description: string }> = {
  Redis: {
    title: "Distributed rate limiter with Redis",
    description:
      "Build a request rate limiter backed by Redis, sitting in front of an existing API. Covers caching, TTL keys, and sliding-window counters.",
  },
  AWS: {
    title: "Deploy a containerized API to AWS",
    description:
      "Take an existing backend, containerize it, and deploy to AWS (EC2 or ECS) with an RDS-backed database and a load balancer in front.",
  },
  Kafka: {
    title: "Event-driven notification service",
    description:
      "Build a service that publishes events to Kafka and has consumers that send notifications. Covers producers, consumers, and topic design.",
  },
  Kubernetes: {
    title: "Kubernetes deployment for a multi-service app",
    description:
      "Take a multi-container app and write the Kubernetes manifests to deploy it: deployments, services, config maps, and a basic ingress.",
  },
  "System Design": {
    title: "Design doc + prototype for a URL shortener at scale",
    description:
      "Write a one-page design doc covering sharding, caching, and read/write ratios, then build a working prototype of the core service.",
  },
  Docker: {
    title: "Containerize an existing project end-to-end",
    description:
      "Add a Dockerfile and docker-compose setup to one of your existing projects, including the database and a healthcheck.",
  },
  "CI/CD": {
    title: "CI/CD pipeline for an existing repo",
    description:
      "Add a GitHub Actions workflow that runs tests, lints, and builds a Docker image on every push to one of your existing repos.",
  },
  GCP: {
    title: "Deploy a service to Google Cloud Run",
    description:
      "Containerize an API and deploy it to Cloud Run with a managed Postgres instance and basic monitoring.",
  },
  "Machine Learning": {
    title: "End-to-end ML model with a serving API",
    description:
      "Train a small model on a public dataset, then wrap it in a REST API so it can be called like a real product feature.",
  },
};

const DEFAULT_TEMPLATE = (skill: string) => ({
  title: `Portfolio project featuring ${skill}`,
  description: `A focused project that puts ${skill} at the center, paired with something you already know so it's demonstrable end-to-end.`,
});

function buildWeek(skills: string[]): RoadmapDay[] {
  const days: RoadmapDay[] = [];
  const focuses = [
    `${skills[0]} fundamentals`,
    `${skills[0]} in a real workflow`,
    skills[1] ? `${skills[1]} fundamentals` : "Core integration",
    "Wire the two together",
    "Build the core feature",
    "Write tests",
    "Document and push to GitHub",
  ];
  focuses.forEach((focus, i) => days.push({ day: i + 1, focus }));
  return days;
}

export async function buildRoadmap(gaps: GapItem[], targetRole?: string): Promise<RoadmapPlan> {
  // A project only helps close skills you genuinely don't have yet. A gap
  // that's just "claimed but unverified" is fixed by pushing proof to
  // GitHub, not by building something new — so missing skills lead here,
  // even if an unverified skill technically scored higher impact.
  const missingFirst = [...gaps].sort((a, b) => {
    if (a.missing !== b.missing) return a.missing ? -1 : 1;
    return b.impact - a.impact;
  });
  const top = missingFirst.slice(0, 3).map((g) => g.skill);
  const primary = top[0] ?? "your next skill";
  const template = PROJECT_TEMPLATES[primary] ?? DEFAULT_TEMPLATE(primary);

  let description = template.description;

  if (isLLMAvailable() && top.length > 0) {
    const prompt = `You are a terse technical mentor. In 2 sentences, describe a portfolio project a developer could build to demonstrate these skills: ${top.join(
      ", "
    )}${targetRole ? ` for a target role of ${targetRole}` : ""}. Base idea: "${template.title}". No fluff, no markdown, just the description.`;
    const llmText = await askLLM(prompt);
    if (llmText) description = llmText;
  }

  return {
    targetSkills: top,
    projectTitle: template.title,
    projectDescription: description,
    skillsGained: top,
    week: buildWeek(top.length ? top : [primary]),
  };
}
