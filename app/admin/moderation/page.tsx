import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { moderatePost } from "@/lib/actions/community";

export default async function ModerationPage() {
  await requireRole(["ADMIN"]);

  const reports = await prisma.report.findMany({
    where: { status: "OUVERT" },
    include: { post: { include: { author: true, thread: true } }, reporter: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Modération</h1>

      <div className="mt-6 space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="rounded-lg border border-black/10 bg-white p-5">
            <p className="text-xs text-foreground/50">
              Signalé par {r.reporter.name} dans « {r.post.thread.title} » — motif : {r.reason}
            </p>
            <p className="mt-2 rounded bg-black/[0.03] p-3 text-sm text-foreground/80">
              {r.post.content}
              <span className="mt-1 block text-xs text-foreground/50">— {r.post.author.name}</span>
            </p>
            <div className="mt-3 flex gap-2">
              <form action={moderatePost}>
                <input type="hidden" name="reportId" value={r.id} />
                <input type="hidden" name="action" value="ignorer" />
                <button className="rounded border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5">
                  Ignorer le signalement
                </button>
              </form>
              <form action={moderatePost}>
                <input type="hidden" name="reportId" value={r.id} />
                <input type="hidden" name="action" value="retirer" />
                <button className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700">
                  Retirer le message
                </button>
              </form>
            </div>
          </div>
        ))}
        {reports.length === 0 && <p className="text-foreground/60">Aucun signalement ouvert.</p>}
      </div>
    </div>
  );
}
