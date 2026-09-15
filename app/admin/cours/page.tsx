import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { NIVEAU_LABELS } from "@/lib/labels";
import { validateCourse, rejectCourse } from "@/lib/actions/courses";

export default async function AdminCoursPage() {
  await requireRole(["ADMIN"]);

  const courses = await prisma.course.findMany({
    where: { status: "EN_RELECTURE" },
    include: { author: true },
    orderBy: { updatedAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Validation des cours</h1>
      <p className="mt-1 text-sm text-foreground/60">Cours en attente de relecture par le comité scientifique.</p>

      <div className="mt-6 space-y-4">
        {courses.map((c) => (
          <div key={c.id} className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-dark">{c.title}</p>
                <p className="text-xs text-foreground/50">
                  {NIVEAU_LABELS[c.niveau]} · {c.matiere} · par {c.author.name}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={rejectCourse}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="rounded border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5">
                    Renvoyer en brouillon
                  </button>
                </form>
                <form action={validateCourse}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">
                    Valider et publier
                  </button>
                </form>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-foreground/70">{c.summary}</p>
          </div>
        ))}
        {courses.length === 0 && <p className="text-foreground/60">Aucun cours en attente.</p>}
      </div>
    </div>
  );
}
