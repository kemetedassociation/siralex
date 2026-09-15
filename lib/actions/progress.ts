"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function markCourseStarted(courseId: string) {
  const user = await requireUser();
  await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: {},
    create: { userId: user.id, courseId, status: "EN_COURS", lastPosition: 5 },
  });
}

export async function markCourseCompleted(formData: FormData) {
  const user = await requireUser();
  const courseId = String(formData.get("courseId"));
  const slug = String(formData.get("slug"));

  await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    update: { status: "TERMINE", lastPosition: 100 },
    create: { userId: user.id, courseId, status: "TERMINE", lastPosition: 100 },
  });

  revalidatePath(`/formation/${slug}`);
  revalidatePath("/tableau-de-bord");
}
