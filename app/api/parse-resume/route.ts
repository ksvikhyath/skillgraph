import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      // Lazy import: pdf-parse touches the filesystem on import in some
      // versions, so only load it when actually needed.
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      return NextResponse.json({ text: data.text });
    }

    // Treat anything else (.txt, .md) as plain text.
    return NextResponse.json({ text: buffer.toString("utf-8") });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Couldn't read that file. Try pasting the resume text directly instead." },
      { status: 500 }
    );
  }
}
