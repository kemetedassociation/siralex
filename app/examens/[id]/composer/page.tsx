import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { ExamComposer } from "@/components/exam-composer";

export default async function ComposerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  const exam = await prisma.exam.findUnique({ where: { id }, include: { questions: { orderBy: { order: "asc" } } } });
  if (!exam) notFound();

  const submission = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId: id, studentId: user.id } },
  });
  if (!submission) redirect(`/examens/${id}`);
  if (submission.status !== "EN_COURS") redirect(`/examens/${id}/resultat`);

  const deadline = new Date(submission.startedAt.getTime() + exam.durationMin * 60000);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">{exam.title}</h1>
      <p className="mt-1 text-sm text-foreground/60">Composition en conditions réelles — ne quittez pas cette page.</p>

      <div className="mt-6">
        <ExamComposer
          examId={exam.id}
          type={exam.type}
          questions={exam.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: JSON.parse(q.options) as string[],
          }))}
          initialAnswers={submission.answers ? JSON.parse(submission.answers) : {}}
          initialEssay={submission.essayContent ?? ""}
          deadline={deadline.toISOString()}
        />
      </div>
    </div>
  );
}
