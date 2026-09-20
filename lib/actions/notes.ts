"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function createNote(formData: FormData) {
  const user = await requireUser();
  const legalTextId = String(formData.get("legalTextId"));
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  await prisma.note.create({ data: { userId: user.id, legalTextId, content } });
  revalidatePath(`/documentation/textes/${legalTextId}`);
}

export async function deleteNote(formData: FormData) {
  const user = await requireUser();
  const noteId = String(formData.get("noteId"));
  const legalTextId = String(formData.get("legalTextId"));

  await prisma.note.deleteMany({ where: { id: noteId, userId: user.id } });
  revalidatePath(`/documentation/textes/${legalTextId}`);
}
