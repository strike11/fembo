"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { QUIZ_QUESTIONS } from "@/lib/quiz";

export default function QuizPage() {
  const [slug, setSlug] = useState("aki");
  const [answers, setAnswers] = useState<number[]>(Array.from({ length: QUIZ_QUESTIONS.length }, () => 1));
  const [result, setResult] = useState<{ score: number; label: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const response = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, answers }),
    });
    const payload = (await response.json()) as {
      result?: { score: number; label: string };
      error?: string;
    };
    setBusy(false);
    if (!response.ok || !payload.result) {
      toast.error(payload.error ?? "The quiz stayed unfinished");
      return;
    }
    setResult(payload.result);
    toast.success("Saved as a memory they can use");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Fit" title="How the room should treat you">
        <p>Five quiet questions. The score becomes a memory, not a verdict.</p>
      </PageIntro>
      <CompanionSelect value={slug} onChange={setSlug} />
      {QUIZ_QUESTIONS.map((question, index) => (
        <fieldset key={question.prompt} className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <legend className="px-1 text-sm font-medium">{question.prompt}</legend>
          <div className="mt-3 flex flex-col gap-2">
            {question.options.map((option, optionIndex) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`q-${index}`}
                  checked={answers[index] === optionIndex}
                  onChange={() =>
                    setAnswers((current) => current.map((value, cursor) => (cursor === index ? optionIndex : value)))
                  }
                />
                {option}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <Button type="button" disabled={busy} onClick={() => void submit()}>
        {busy ? "Reading…" : "Save the read"}
      </Button>
      {result ? (
        <p className="text-sm">
          {result.label} · {result.score}
        </p>
      ) : null}
    </main>
  );
}
