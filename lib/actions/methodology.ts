"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { analyzeMethodologyResponse } from "@/lib/methodology-scoring";

export async function saveMethodologyResponse(formData: FormData) {
  const user = await requireUser();
  const exerciseId = String(formData.get("exerciseId"));
  const slug = String(formData.get("slug"));
  const content = String(formData.get("content") ?? "");

  await prisma.methodologyResponse.upsert({
    where: { userId_exerciseId: { userId: user.id, exerciseId } },
    update: { content, score: null, feedback: null, analyzedAt: null },
    create: { userId: user.id, exerciseId, content },
  });

  revalidatePath(`/methodologie/${slug}`);
}

export async function analyzeMethodologyResponseAction(formData: FormData) {
  const user = await requireUser();
  const exerciseId = String(formData.get("exerciseId"));
  const slug = String(formData.get("slug"));
  const content = String(formData.get("content") ?? "");

  const exercise = await prisma.methodologyExercise.findUnique({
    where: { id: exerciseId },
    include: { guide: true },
  });
  if (!exercise) return;

  const { score, checks } = analyzeMethodologyResponse(exercise.guide.type, content);

  await prisma.methodologyResponse.upsert({
    where: { userId_exerciseId: { userId: user.id, exerciseId } },
    update: { content, score, feedback: JSON.stringify(checks), analyzedAt: new Date() },
    create: {
      userId: user.id,
      exerciseId,
      content,
      score,
      feedback: JSON.stringify(checks),
      analyzedAt: new Date(),
    },
  });

  revalidatePath(`/methodologie/${slug}`);
}
