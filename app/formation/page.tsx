import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NIVEAU_LABELS, PROGRESS_LABELS } from "@/lib/labels";
import { canAccessCourse, type FormuleKey } from "@/lib/access";

export default async function FormationPage({
  searchParams,
}: {
  searchParams: Promise<{ niveau?: string; matiere?: string; q?: string }>;
}) {
  const { niveau, matiere, q } = await searchParams;
  const session = await getSession();

  const courses = await prisma.course.findMany({
    where: {
      status: "PUBLIE",
      ...(niveau ? { niveau: niveau as never } : {}),
      ...(matiere ? { matiere } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { summary: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    include: {
      progress: session?.user ? { where: { userId: session.user.id } } : false,
    },
  });

  const matieres = await prisma.course.findMany({
    where: { status: "PUBLIE" },
    select: { matiere: true },
    distinct: ["matiere"],
  });

  let plan: FormuleKey = "GRATUITE";
  if (session?.user) {
    const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
    if (sub) plan = sub.plan as FormuleKey;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Catalogue de formation</h1>
      <p className="mt-1 text-foreground/60">
        Cours validés par le comité scientifique, classés par niveau, matière et filière.
      </p>

      <form className="mt-6 flex flex-wrap gap-3 text-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher une notion, un titre…"
          className="w-64 rounded border border-black/15 px-3 py-2"
        />
        <select name="niveau" defaultValue={niveau ?? ""} className="rounded border border-black/15 px-3 py-2">
          <option value="">Tous niveaux</option>
          {Object.entries(NIVEAU_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select name="matiere" defaultValue={matiere ?? ""} className="rounded border border-black/15 px-3 py-2">
          <option value="">Toutes matières</option>
          {matieres.map((m) => (
            <option key={m.matiere} value={m.matiere}>
              {m.matiere}
            </option>
          ))}
        </select>
        <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
          Filtrer
        </button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => {
          const accessible = canAccessCourse(plan, c.niveau);
          const progress = "progress" in c && Array.isArray(c.progress) ? c.progress[0] : undefined;
          return (
            <Link
              key={c.id}
              href={`/formation/${c.slug}`}
              className="card-lift flex flex-col rounded-lg border border-black/10 bg-white p-5 hover:border-brand"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">
                  {NIVEAU_LABELS[c.niveau]}
                </span>
                {!accessible && (
                  <span className="rounded bg-gold/15 px-2 py-0.5 font-medium text-gold">Premium</span>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-brand-dark">{c.title}</h3>
              <p className="mt-1 text-sm text-foreground/60">{c.matiere}</p>
              <p className="mt-2 line-clamp-2 text-sm text-foreground/70">{c.summary}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-foreground/50">
                <span>{c.durationMin} min de lecture</span>
                {progress && <span>{PROGRESS_LABELS[progress.status]}</span>}
              </div>
            </Link>
          );
        })}
        {courses.length === 0 && (
          <p className="col-span-full text-foreground/60">Aucun cours ne correspond à ces critères.</p>
        )}
      </div>
    </div>
  );
}
