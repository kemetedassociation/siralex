import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { EXAM_TYPE_LABELS, NIVEAU_LABELS } from "@/lib/labels";

export default async function ExamensPage() {
  const session = await getSession();

  const exams = await prisma.exam.findMany({
    where: { status: "PUBLIE" },
    orderBy: { openAt: "desc" },
    include: {
      submissions: session?.user ? { where: { studentId: session.user.id } } : false,
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Examens et évaluations</h1>
      <p className="mt-1 text-foreground/60">
        QCM chronométrés, cas pratiques, dissertations et annales en conditions réelles. Outil
        d&apos;entraînement formatif — non certifiant.
      </p>

      <div className="mt-8 space-y-3">
        {exams.map((e) => {
          const submission = "submissions" in e && Array.isArray(e.submissions) ? e.submissions[0] : undefined;
          return (
            <div key={e.id} className="rounded-lg border border-black/10 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">
                  {EXAM_TYPE_LABELS[e.type]}
                </span>
                <span className="text-foreground/50">{NIVEAU_LABELS[e.niveau]}</span>
                <span className="text-foreground/50">· {e.matiere}</span>
                <span className="text-foreground/50">· {e.durationMin} min</span>
              </div>
              <h3 className="mt-2 font-semibold text-brand-dark">{e.title}</h3>
              <div className="mt-3 flex items-center justify-between">
                {submission ? (
                  <span className="text-sm text-foreground/60">
                    {submission.status === "EN_COURS" && "Composition en cours"}
                    {submission.status === "SOUMISE" && "Copie soumise — en attente de correction"}
                    {submission.status === "CORRIGEE" &&
                      `Corrigée · note ${submission.note?.toFixed(2)}/20`}
                  </span>
                ) : (
                  <span className="text-sm text-foreground/50">Pas encore commencée</span>
                )}
                <Link
                  href={submission?.status === "EN_COURS" ? `/examens/${e.id}/composer` : `/examens/${e.id}`}
                  className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
                >
                  {submission ? "Voir" : "Commencer"}
                </Link>
              </div>
            </div>
          );
        })}
        {exams.length === 0 && <p className="text-foreground/60">Aucune épreuve publiée pour le moment.</p>}
      </div>
    </div>
  );
}
