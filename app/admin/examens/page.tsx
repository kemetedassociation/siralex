import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { EXAM_TYPE_LABELS, NIVEAU_LABELS } from "@/lib/labels";
import { validateExam } from "@/lib/actions/exams";

export default async function AdminExamensPage() {
  await requireRole(["ADMIN"]);

  const exams = await prisma.exam.findMany({
    where: { status: "EN_RELECTURE" },
    include: { author: true, questions: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Validation des épreuves</h1>

      <div className="mt-6 space-y-4">
        {exams.map((e) => (
          <div key={e.id} className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-dark">{e.title}</p>
                <p className="text-xs text-foreground/50">
                  {EXAM_TYPE_LABELS[e.type]} · {NIVEAU_LABELS[e.niveau]} · par {e.author.name}
                  {e.type === "QCM" && ` · ${e.questions.length} questions`}
                </p>
              </div>
              <form action={validateExam}>
                <input type="hidden" name="id" value={e.id} />
                <button className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">
                  Valider et publier
                </button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-foreground/70">{e.instructions}</p>
          </div>
        ))}
        {exams.length === 0 && <p className="text-foreground/60">Aucune épreuve en attente.</p>}
      </div>
    </div>
  );
}
