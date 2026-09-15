import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { replyToThread, reportPost } from "@/lib/actions/community";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thread = await prisma.forumThread.findUnique({
    where: { id },
    include: { author: true, posts: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!thread) notFound();

  const session = await getSession();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/communaute" className="text-sm text-brand hover:underline">
        ← Retour à la communauté
      </Link>

      <div className="mt-3 flex items-center gap-2 text-xs text-foreground/50">
        {thread.matiere && <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">{thread.matiere}</span>}
        {thread.promotion && <span>{thread.promotion}</span>}
      </div>
      <h1 className="mt-2 font-serif text-2xl font-semibold text-brand-dark">{thread.title}</h1>

      <div className="mt-6 space-y-4">
        {thread.posts.map((p) => (
          <div key={p.id} className="rounded border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between text-xs text-foreground/50">
              <span className="font-medium text-foreground/80">{p.author.name}</span>
              <span>{p.createdAt.toLocaleString("fr-FR")}</span>
            </div>
            {p.removed ? (
              <p className="mt-2 text-sm italic text-foreground/40">Ce message a été retiré par la modération.</p>
            ) : (
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">{p.content}</p>
            )}
            {session?.user && !p.removed && (
              <form action={reportPost} className="mt-2">
                <input type="hidden" name="postId" value={p.id} />
                <button className="text-xs text-foreground/40 hover:text-red-600">Signaler</button>
              </form>
            )}
          </div>
        ))}
      </div>

      {session?.user ? (
        <form action={replyToThread} className="mt-6 space-y-2">
          <input type="hidden" name="threadId" value={thread.id} />
          <textarea name="content" required rows={4} className="w-full rounded border border-black/15 px-3 py-2" placeholder="Votre réponse…" />
          <button className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">Répondre</button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-foreground/60">
          <Link href="/connexion" className="text-brand hover:underline">Connectez-vous</Link> pour répondre.
        </p>
      )}
    </div>
  );
}
