import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { correctSubmission } from "@/lib/actions/exams";

export default async function CorrectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["ENSEIGNANT", "ADMIN"]);
  const { id } = await params;

  const submission = await prisma.examSubmission.findUnique({
    where: { id },
    include: { exam: true, student: true },
  });
  if (!submission) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">{submission.exam.title}</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Candidat : {submission.student.name} · soumise le {submission.submittedAt?.toLocaleString("fr-FR")}
      </p>

      <div className="mt-6 rounded border border-black/10 bg-white p-4">
        <p className="text-sm font-medium text-brand-dark">Consignes de l&apos;épreuve</p>
        <p className="mt-1 whitespace-pre-line text-sm text-foreground/70">{submission.exam.instructions}</p>
      </div>

      <div className="mt-4 rounded border border-black/10 bg-white p-4">
        <p className="text-sm font-medium text-brand-dark">Copie de l&apos;étudiant</p>
        <p className="mt-2 whitespace-pre-line font-serif text-sm leading-relaxed text-foreground/90">
          {submission.essayContent}
        </p>
      </div>

      {submission.status === "CORRIGEE" ? (
        <div className="mt-6 rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Déjà corrigée — note {submission.note?.toFixed(2)}/20
        </div>
      ) : (
        <form action={correctSubmission} className="mt-6 space-y-3 rounded border border-black/10 bg-white p-4">
          <input type="hidden" name="submissionId" value={submission.id} />
          <div>
            <label className="block text-sm font-medium text-foreground/80">Note / 20</label>
            <input type="number" name="note" min={0} max={20} step={0.25} required className="mt-1 w-32 rounded border border-black/15 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">Annotations</label>
            <textarea name="annotations" rows={6} className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
          </div>
          <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
            Enregistrer la correction
          </button>
        </form>
      )}
    </div>
  );
}
