import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { EXAM_TYPE_LABELS, NIVEAU_LABELS } from "@/lib/labels";
import { startExam } from "@/lib/actions/exams";

export default async function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({ where: { id } });
  if (!exam || exam.status !== "PUBLIE") notFound();

  const session = await getSession();
  if (session?.user) {
    const submission = await prisma.examSubmission.findUnique({
      where: { examId_studentId: { examId: id, studentId: session.user.id } },
    });
    if (submission) {
      redirect(submission.status === "EN_COURS" ? `/examens/${id}/composer` : `/examens/${id}/resultat`);
    }
  }

  const startExamWithId = startExam.bind(null, exam.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/examens" className="text-sm text-brand hover:underline">
        ← Retour aux examens
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">
          {EXAM_TYPE_LABELS[exam.type]}
        </span>
        <span className="text-foreground/50">{NIVEAU_LABELS[exam.niveau]}</span>
        <span className="text-foreground/50">· {exam.matiere}</span>
      </div>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-brand-dark">{exam.title}</h1>

      <div className="mt-6 rounded border border-black/10 bg-white p-5">
        <p className="text-sm font-medium text-brand-dark">Consignes</p>
        <p className="mt-1 whitespace-pre-line text-sm text-foreground/70">{exam.instructions}</p>
        {exam.documents && (
          <>
            <p className="mt-4 text-sm font-medium text-brand-dark">Documents joints</p>
            <p className="mt-1 whitespace-pre-line text-sm text-foreground/70">{exam.documents}</p>
          </>
        )}
        <div className="mt-4 flex gap-4 text-sm text-foreground/60">
          <span>Durée : {exam.durationMin} min</span>
          {exam.bareme && <span>Barème : {exam.bareme}</span>}
        </div>
      </div>

      <div className="mt-6 rounded border border-gold/40 bg-gold/10 p-4 text-sm text-foreground/70">
        Le minuteur démarre dès le lancement de la composition. La copie sera soumise
        automatiquement à l&apos;expiration du temps imparti. Cet exercice est formatif et non
        certifiant.
      </div>

      {session?.user ? (
        <form action={startExamWithId} className="mt-6">
          <button className="rounded bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark">
            Démarrer la composition
          </button>
        </form>
      ) : (
        <Link
          href="/connexion"
          className="mt-6 inline-block rounded bg-brand px-5 py-2.5 font-medium text-white hover:bg-brand-dark"
        >
          Se connecter pour composer
        </Link>
      )}
    </div>
  );
}
