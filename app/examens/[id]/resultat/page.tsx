import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { EXAM_TYPE_LABELS } from "@/lib/labels";

export default async function ResultatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam) notFound();

  const submission = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId: id, studentId: user.id } },
  });
  if (!submission) redirect(`/examens/${id}`);
  if (submission.status === "EN_COURS") redirect(`/examens/${id}/composer`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/examens" className="text-sm text-brand hover:underline">
        ← Retour aux examens
      </Link>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-brand-dark">{exam.title}</h1>
      <p className="mt-1 text-sm text-foreground/60">{EXAM_TYPE_LABELS[exam.type]}</p>

      <div className="mt-6 rounded border border-black/10 bg-white p-5">
        <p className="text-sm text-foreground/60">
          Copie soumise le {submission.submittedAt?.toLocaleString("fr-FR")}
        </p>

        {submission.status === "SOUMISE" && (
          <p className="mt-3 rounded bg-gold/10 px-3 py-2 text-sm text-foreground/80">
            Votre copie est en attente de correction. Délai indicatif : 5 à 10 jours ouvrés. Vous
            serez notifié dès que la note et les annotations seront disponibles.
          </p>
        )}

        {submission.status === "CORRIGEE" && (
          <div className="mt-3">
            <p className="text-2xl font-semibold text-brand-dark">{submission.note?.toFixed(2)} / 20</p>
            {submission.annotations && (
              <div className="mt-3">
                <p className="text-sm font-medium text-brand-dark">Annotations du correcteur</p>
                <p className="mt-1 whitespace-pre-line text-sm text-foreground/70">{submission.annotations}</p>
              </div>
            )}
          </div>
        )}

        {exam.type !== "QCM" && submission.essayContent && (
          <div className="mt-6 border-t border-black/10 pt-4">
            <p className="text-sm font-medium text-brand-dark">Votre copie</p>
            <p className="mt-2 whitespace-pre-line text-sm text-foreground/70">{submission.essayContent}</p>
          </div>
        )}
      </div>
    </div>
  );
}
