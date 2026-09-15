"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/session";

export async function startExam(examId: string) {
  const user = await requireUser();

  const existing = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId, studentId: user.id } },
  });
  if (!existing) {
    await prisma.examSubmission.create({
      data: { examId, studentId: user.id, status: "EN_COURS" },
    });
  }

  redirect(`/examens/${examId}/composer`);
}

export async function saveQcmAnswer(formData: FormData) {
  const user = await requireUser();
  const examId = String(formData.get("examId"));
  const questionId = String(formData.get("questionId"));
  const optionIndex = Number(formData.get("optionIndex"));

  const submission = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId, studentId: user.id } },
  });
  if (!submission || submission.status !== "EN_COURS") return;

  const answers = submission.answers ? JSON.parse(submission.answers) : {};
  answers[questionId] = optionIndex;

  await prisma.examSubmission.update({
    where: { id: submission.id },
    data: { answers: JSON.stringify(answers) },
  });
  revalidatePath(`/examens/${examId}/composer`);
}

export async function saveEssayDraft(formData: FormData) {
  const user = await requireUser();
  const examId = String(formData.get("examId"));
  const content = String(formData.get("content") ?? "");

  const submission = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId, studentId: user.id } },
  });
  if (!submission || submission.status !== "EN_COURS") return;

  await prisma.examSubmission.update({
    where: { id: submission.id },
    data: { essayContent: content },
  });
}

export async function submitExam(formData: FormData) {
  const user = await requireUser();
  const examId = String(formData.get("examId"));

  const exam = await prisma.exam.findUnique({ where: { id: examId }, include: { questions: true } });
  const submission = await prisma.examSubmission.findUnique({
    where: { examId_studentId: { examId, studentId: user.id } },
  });
  if (!exam || !submission || submission.status !== "EN_COURS") {
    redirect(`/examens/${examId}/resultat`);
  }

  if (exam!.type === "QCM") {
    const answers: Record<string, number> = submission!.answers ? JSON.parse(submission!.answers) : {};
    const total = exam!.questions.length || 1;
    const correct = exam!.questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const autoScore = Math.round((correct / total) * 20 * 100) / 100;

    await prisma.examSubmission.update({
      where: { id: submission!.id },
      data: {
        submittedAt: new Date(),
        status: "CORRIGEE",
        autoScore,
        note: autoScore,
        correctedAt: new Date(),
      },
    });
  } else {
    const content = formData.get("content");
    await prisma.examSubmission.update({
      where: { id: submission!.id },
      data: {
        submittedAt: new Date(),
        status: "SOUMISE",
        ...(typeof content === "string" && content.length > 0 ? { essayContent: content } : {}),
      },
    });
  }

  redirect(`/examens/${examId}/resultat`);
}

export async function createExam(formData: FormData) {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);

  const title = String(formData.get("title") ?? "").trim();
  const matiere = String(formData.get("matiere") ?? "").trim();
  const niveau = String(formData.get("niveau"));
  const type = String(formData.get("type"));
  const instructions = String(formData.get("instructions") ?? "").trim();
  const documents = String(formData.get("documents") ?? "").trim() || undefined;
  const durationMin = Number(formData.get("durationMin") ?? 60);
  const bareme = String(formData.get("bareme") ?? "").trim() || undefined;

  if (!title || !matiere || !instructions) return;

  const exam = await prisma.exam.create({
    data: {
      title,
      matiere,
      niveau: niveau as never,
      type: type as never,
      instructions,
      documents,
      durationMin,
      bareme,
      status: "BROUILLON",
      authorId: user.id,
    },
  });

  revalidatePath("/enseignant/examens");
  redirect(`/enseignant/examens/${exam.id}`);
}

export async function addQuestion(formData: FormData) {
  await requireRole(["ENSEIGNANT", "ADMIN"]);
  const examId = String(formData.get("examId"));
  const question = String(formData.get("question") ?? "").trim();
  const options = [1, 2, 3, 4]
    .map((i) => String(formData.get(`option${i}`) ?? "").trim())
    .filter(Boolean);
  const correctIndex = Number(formData.get("correctIndex") ?? 0);

  if (!question || options.length < 2) return;

  const count = await prisma.examQuestion.count({ where: { examId } });
  await prisma.examQuestion.create({
    data: { examId, question, options: JSON.stringify(options), correctIndex, order: count },
  });

  revalidatePath(`/enseignant/examens/${examId}`);
}

export async function submitExamForReview(formData: FormData) {
  await requireRole(["ENSEIGNANT", "ADMIN"]);
  const id = String(formData.get("id"));
  await prisma.exam.update({ where: { id }, data: { status: "EN_RELECTURE" } });
  revalidatePath(`/enseignant/examens/${id}`);
}

export async function validateExam(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));

  await prisma.exam.update({
    where: { id },
    data: { status: "PUBLIE", validatorId: admin.id, openAt: new Date() },
  });

  revalidatePath("/admin/examens");
  revalidatePath("/examens");
}

export async function correctSubmission(formData: FormData) {
  const corrector = await requireRole(["ENSEIGNANT", "ADMIN"]);
  const submissionId = String(formData.get("submissionId"));
  const note = Number(formData.get("note"));
  const annotations = String(formData.get("annotations") ?? "");

  await prisma.examSubmission.update({
    where: { id: submissionId },
    data: { note, annotations, status: "CORRIGEE", correctedAt: new Date(), correctorId: corrector.id },
  });

  revalidatePath("/enseignant/correction");
}
