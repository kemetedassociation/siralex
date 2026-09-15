"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function toggleFavoriteText(formData: FormData) {
  const user = await requireUser();
  const legalTextId = String(formData.get("legalTextId"));

  const existing = await prisma.favorite.findFirst({ where: { userId: user.id, legalTextId } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, legalTextId } });
  }
  revalidatePath("/documentation");
}

export async function toggleFavoriteJurisprudence(formData: FormData) {
  const user = await requireUser();
  const jurisprudenceId = String(formData.get("jurisprudenceId"));

  const existing = await prisma.favorite.findFirst({ where: { userId: user.id, jurisprudenceId } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: user.id, jurisprudenceId } });
  }
  revalidatePath("/documentation");
}

export async function subscribeAlert(formData: FormData) {
  const user = await requireUser();
  const legalTextId = formData.get("legalTextId") ? String(formData.get("legalTextId")) : undefined;
  const thematique = formData.get("thematique") ? String(formData.get("thematique")) : undefined;

  if (!legalTextId && !thematique) return;

  const existing = await prisma.alert.findFirst({
    where: { userId: user.id, legalTextId: legalTextId ?? null, thematique: thematique ?? null },
  });
  if (existing) return;

  await prisma.alert.create({
    data: {
      userId: user.id,
      cible: legalTextId ? "TEXTE" : "THEMATIQUE",
      legalTextId,
      thematique,
    },
  });
  revalidatePath("/documentation");
}
