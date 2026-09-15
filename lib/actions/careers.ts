"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/session";

export async function submitOffer(formData: FormData) {
  const user = await requireRole(["ENSEIGNANT", "PROFESSIONNEL", "INSTITUTION", "ADMIN"]);

  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type"));
  const organisation = String(formData.get("organisation") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !organisation || !description) return;

  await prisma.careerOffer.create({
    data: {
      title,
      type: type as never,
      organisation,
      description,
      authorId: user.id,
      status: user.role === "ADMIN" ? "VALIDEE" : "EN_ATTENTE",
    },
  });

  revalidatePath("/carrieres");
  redirect("/carrieres?soumis=1");
}

export async function applyToOffer(formData: FormData) {
  const user = await requireUser();
  const offerId = String(formData.get("offerId"));
  const message = String(formData.get("message") ?? "").trim();

  const existing = await prisma.application.findUnique({
    where: { offerId_userId: { offerId, userId: user.id } },
  });
  if (existing) return;

  await prisma.application.create({ data: { offerId, userId: user.id, message } });
  revalidatePath(`/carrieres/${offerId}`);
}

export async function decideOffer(formData: FormData) {
  const moderator = await requireRole(["ADMIN"]);
  const offerId = String(formData.get("offerId"));
  const decision = String(formData.get("decision")); // "valider" | "rejeter"

  await prisma.careerOffer.update({
    where: { id: offerId },
    data: { status: decision === "valider" ? "VALIDEE" : "REJETEE", validatorId: moderator.id },
  });

  revalidatePath("/admin/carrieres");
  revalidatePath("/carrieres");
}
