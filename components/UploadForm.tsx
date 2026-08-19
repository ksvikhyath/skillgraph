"use client";

import { useRef, useState } from "react";

interface Props {
  onSubmit: (data: {
    resumeText: string;
    jobText: string;
    githubUsername: string;
    targetRole: string;
  }) => void;
  submitting: boolean;
  error: string | null;
}

export default function UploadForm({ onSubmit, submitting, error }: Props) {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [jobText, setJobText] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setParsing(true);
    setResumeFileName(file.name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      const data = await res.json();
      if (data.text) setResumeText(data.text);
    } finally {
      setParsing(false);
    }
  }

  const ready = resumeText.trim().length > 20 && jobText.trim().length > 20;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        onSubmit({ resumeText, jobText, githubUsername: githubUsername.trim(), targetRole });
      }}
      className="grid gap-8 md:grid-cols-2"
    >
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <label className="font-mono text-xs uppercase tracking-wider text-fog">
            01 · Your resume
          </label>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="text-xs text-signal hover:underline focus-ring"
          >
            {parsing ? "Reading…" : resumeFileName ? `Change file (${resumeFileName})` : "Upload PDF/TXT"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".pdf,.txt,.md"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here, or upload a file above."
          className="focus-ring h-56 w-full resize-none rounded-md border border-line bg-panel p-4 text-sm text-paper placeholder:text-fog/60"
        />
        <p className="text-xs text-fog">Nothing is stored — this stays in your browser session.</p>
      </div>

      <div className="space-y-3">
        <label className="font-mono text-xs uppercase tracking-wider text-fog">
          02 · The job you want
        </label>
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste the job description you're targeting."
          className="focus-ring h-56 w-full resize-none rounded-md border border-line bg-panel p-4 text-sm text-paper placeholder:text-fog/60"
        />
        <p className="text-xs text-fog">Adjectives don't move this number. Specifics do.</p>
      </div>

      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-wider text-fog">
          03 · GitHub username (optional)
        </label>
        <input
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
          placeholder="e.g. octocat"
          className="focus-ring w-full rounded-md border border-line bg-panel p-3 text-sm text-paper placeholder:text-fog/60"
        />
        <p className="text-xs text-fog">
          We check your public repos for real evidence — Dockerfiles, CI configs, languages used.
        </p>
      </div>

      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-wider text-fog">
          04 · Target role (optional)
        </label>
        <input
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Backend Engineer"
          className="focus-ring w-full rounded-md border border-line bg-panel p-3 text-sm text-paper placeholder:text-fog/60"
        />
        <p className="text-xs text-fog">Used to tailor the roadmap at the end, nothing else.</p>
      </div>

      <div className="md:col-span-2">
        {error && <p className="mb-3 text-sm text-rose">{error}</p>}
        <button
          type="submit"
          disabled={!ready || submitting}
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-amber px-6 py-3 font-mono text-sm font-medium text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Building your skill graph…" : "Analyze match"}
        </button>
      </div>
    </form>
  );
}
