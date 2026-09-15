"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/session";

export async function createThread(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const matiere = String(formData.get("matiere") ?? "").trim() || undefined;
  const promotion = String(formData.get("promotion") ?? "").trim() || undefined;
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !content) return;

  const thread = await prisma.forumThread.create({
    data: {
      title,
      matiere,
      promotion,
      authorId: user.id,
      posts: { create: { authorId: user.id, content } },
    },
  });

  revalidatePath("/communaute");
  redirect(`/communaute/${thread.id}`);
}

export async function replyToThread(formData: FormData) {
  const user = await requireUser();
  const threadId = String(formData.get("threadId"));
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  await prisma.forumPost.create({ data: { threadId, authorId: user.id, content } });
  revalidatePath(`/communaute/${threadId}`);
}

export async function reportPost(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get("postId"));
  const reason = String(formData.get("reason") ?? "Contenu inapproprié");

  await prisma.report.create({ data: { postId, reporterId: user.id, reason } });

  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (post) revalidatePath(`/communaute/${post.threadId}`);
}

export async function moderatePost(formData: FormData) {
  const moderator = await requireRole(["ADMIN", "ENSEIGNANT"]);
  const reportId = String(formData.get("reportId"));
  const action = String(formData.get("action")); // "retirer" | "ignorer"

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return;

  if (action === "retirer") {
    await prisma.forumPost.update({ where: { id: report.postId }, data: { removed: true } });
  }
  await prisma.report.update({
    where: { id: reportId },
    data: { status: "TRAITE", moderatorId: moderator.id },
  });

  revalidatePath("/admin/moderation");
}
