import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { EXAM_TYPE_LABELS, NIVEAU_LABELS } from "@/lib/labels";
import { addQuestion, submitExamForReview } from "@/lib/actions/exams";

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_RELECTURE: "En relecture",
  PUBLIE: "Publié",
};

export default async function EnseignantExamenDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);
  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!exam) notFound();
  if (exam.authorId !== user.id && user.role !== "ADMIN") redirect("/enseignant/examens");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-brand-dark">{exam.title}</h1>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            exam.status === "PUBLIE" ? "bg-green-50 text-green-700" : exam.status === "EN_RELECTURE" ? "bg-gold/15 text-gold" : "bg-black/5 text-foreground/60"
          }`}
        >
          {STATUS_LABELS[exam.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-foreground/60">
        {EXAM_TYPE_LABELS[exam.type]} · {NIVEAU_LABELS[exam.niveau]} · {exam.durationMin} min
      </p>

      {exam.type === "QCM" && (
        <div className="mt-6">
          <h2 className="font-semibold text-brand-dark">Questions ({exam.questions.length})</h2>
          <div className="mt-2 space-y-2">
            {exam.questions.map((q, i) => (
              <div key={q.id} className="rounded border border-black/10 bg-white p-3 text-sm">
                <p className="font-medium">{i + 1}. {q.question}</p>
                <ul className="mt-1 list-disc pl-5 text-foreground/60">
                  {(JSON.parse(q.options) as string[]).map((o, idx) => (
                    <li key={idx} className={idx === q.correctIndex ? "font-medium text-green-700" : ""}>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {exam.status === "BROUILLON" && (
            <form action={addQuestion} className="mt-4 space-y-2 rounded border border-black/10 bg-white p-4">
              <input type="hidden" name="examId" value={exam.id} />
              <label className="block text-sm font-medium text-foreground/80">Question</label>
              <input name="question" required className="w-full rounded border border-black/15 px-3 py-2" />
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <input key={i} name={`option${i}`} placeholder={`Option ${i}`} className="rounded border border-black/15 px-3 py-2" />
                ))}
              </div>
              <label className="block text-sm font-medium text-foreground/80">Index de la bonne réponse (0-3)</label>
              <input type="number" name="correctIndex" min={0} max={3} defaultValue={0} className="w-24 rounded border border-black/15 px-3 py-2" />
              <button className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
                Ajouter la question
              </button>
            </form>
          )}
        </div>
      )}

      {exam.status === "BROUILLON" && (
        <form action={submitExamForReview} className="mt-6">
          <input type="hidden" name="id" value={exam.id} />
          <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
            Soumettre pour relecture
          </button>
        </form>
      )}
    </div>
  );
}
