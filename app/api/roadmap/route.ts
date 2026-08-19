import { NextRequest, NextResponse } from "next/server";
import { buildRoadmap } from "@/lib/roadmap";
import { GapItem } from "@/lib/scoring";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const gaps: GapItem[] = body.gaps ?? [];
    const targetRole: string | undefined = body.targetRole;

    if (!Array.isArray(gaps) || gaps.length === 0) {
      return NextResponse.json({ error: "No gaps provided." }, { status: 400 });
    }

    const plan = await buildRoadmap(gaps, targetRole);
    return NextResponse.json(plan);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Roadmap generation failed." }, { status: 500 });
  }
}
