"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveQcmAnswer, saveEssayDraft, submitExam } from "@/lib/actions/exams";

type Question = {
  id: string;
  question: string;
  options: string[];
};

export function ExamComposer({
  examId,
  type,
  questions,
  initialAnswers,
  initialEssay,
  deadline,
}: {
  examId: string;
  type: string;
  questions: Question[];
  initialAnswers: Record<string, number>;
  initialEssay: string;
  deadline: string; // ISO
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [essay, setEssay] = useState(initialEssay);
  const [remaining, setRemaining] = useState(() => msRemaining(deadline));
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [, startTransition] = useTransition();
  const submittedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const tick = setInterval(() => setRemaining(msRemaining(deadline)), 1000);
    return () => clearInterval(tick);
  }, [deadline]);

  useEffect(() => {
    if (remaining <= 0 && !submittedRef.current) {
      submittedRef.current = true;
      formRef.current?.requestSubmit();
    }
  }, [remaining]);

  // Autosave rédaction toutes les 15 secondes
  useEffect(() => {
    if (type === "QCM") return;
    const id = setInterval(() => {
      const fd = new FormData();
      fd.set("examId", examId);
      fd.set("content", essay);
      startTransition(() => {
        saveEssayDraft(fd).then(() => setSavedAt(new Date()));
      });
    }, 15000);
    return () => clearInterval(id);
  }, [essay, examId, type, startTransition]);

  function selectAnswer(questionId: string, optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    const fd = new FormData();
    fd.set("examId", examId);
    fd.set("questionId", questionId);
    fd.set("optionIndex", String(optionIndex));
    startTransition(() => {
      saveQcmAnswer(fd);
    });
  }

  const minutes = Math.max(0, Math.floor(remaining / 60000));
  const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000));

  return (
    <div>
      <div
        className={`sticky top-0 z-10 mb-6 flex items-center justify-between rounded border p-3 text-sm ${
          remaining < 60000 ? "border-red-300 bg-red-50 text-red-700" : "border-black/10 bg-white"
        }`}
      >
        <span className="font-medium">Temps restant</span>
        <span className="font-mono text-lg">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>

      <form ref={formRef} action={submitExam} className="space-y-6">
        <input type="hidden" name="examId" value={examId} />

        {type === "QCM" &&
          questions.map((q, i) => (
            <div key={q.id} className="rounded border border-black/10 bg-white p-4">
              <p className="font-medium text-brand-dark">
                {i + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === idx}
                      onChange={() => selectAnswer(q.id, idx)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}

        {type !== "QCM" && (
          <div>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              rows={20}
              placeholder="Composez votre copie ici…"
              className="w-full rounded border border-black/15 p-4 font-serif text-sm leading-relaxed"
            />
            <p className="mt-1 text-xs text-foreground/50">
              {savedAt ? `Enregistré automatiquement à ${savedAt.toLocaleTimeString("fr-FR")}` : "Enregistrement automatique toutes les 15 secondes."}
            </p>
            <input type="hidden" name="content" value={essay} />
          </div>
        )}

        <button
          type="submit"
          className="rounded bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark"
        >
          Soumettre ma copie
        </button>
      </form>
    </div>
  );
}

function msRemaining(deadline: string) {
  return new Date(deadline).getTime() - Date.now();
}
