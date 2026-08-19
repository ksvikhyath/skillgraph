// Thin wrapper around Google's Gemini API. Entirely optional: every caller
// checks isLLMAvailable() first and falls back to a deterministic method if
// no key is configured, so the app works fully without any paid service.

const GEMINI_MODEL = "gemini-2.0-flash";

export function isLLMAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Ask Gemini a question and get back plain text. Returns null on any failure. */
export async function askLLM(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === "string" ? text.trim() : null;
  } catch {
    return null;
  }
}
