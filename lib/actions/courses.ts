"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export async function createCourse(formData: FormData) {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);

  const title = String(formData.get("title") ?? "").trim();
  const niveau = String(formData.get("niveau"));
  const matiere = String(formData.get("matiere") ?? "").trim();
  const filiere = String(formData.get("filiere") ?? "").trim() || undefined;
  const universite = String(formData.get("universite") ?? "").trim() || undefined;
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const durationMin = Number(formData.get("durationMin") ?? 30);

  if (!title || !matiere || !summary || !content) return;

  const course = await prisma.course.create({
    data: {
      title,
      slug: slugify(title),
      niveau: niveau as never,
      matiere,
      filiere,
      universite,
      summary,
      content,
      durationMin,
      status: "EN_RELECTURE",
      authorId: user.id,
      versions: { create: { content, editedById: user.id } },
    },
  });

  revalidatePath("/enseignant/cours");
  redirect(`/enseignant/cours/${course.id}`);
}

export async function updateCourse(formData: FormData) {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);
  const id = String(formData.get("id"));
  const content = String(formData.get("content") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  if (!content || !summary) return;

  await prisma.course.update({
    where: { id },
    data: {
      content,
      summary,
      status: "EN_RELECTURE",
      versions: { create: { content, editedById: user.id } },
    },
  });

  revalidatePath(`/enseignant/cours/${id}`);
  revalidatePath("/formation");
}

export async function validateCourse(formData: FormData) {
  const admin = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));

  await prisma.course.update({
    where: { id },
    data: { status: "PUBLIE", validatorId: admin.id, publishedAt: new Date() },
  });

  revalidatePath("/admin/cours");
  revalidatePath("/formation");
}

export async function rejectCourse(formData: FormData) {
  await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));

  await prisma.course.update({ where: { id }, data: { status: "BROUILLON" } });
  revalidatePath("/admin/cours");
}
