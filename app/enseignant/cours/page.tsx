import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { NIVEAU_LABELS } from "@/lib/labels";

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_RELECTURE: "En relecture",
  PUBLIE: "Publié",
};

export default async function EnseignantCoursPage() {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);
  const courses = await prisma.course.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-brand-dark">Mes cours</h1>
        <Link href="/enseignant/cours/nouveau" className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Nouveau cours
        </Link>
      </div>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {courses.map((c) => (
          <Link key={c.id} href={`/enseignant/cours/${c.id}`} className="flex items-center justify-between p-4 hover:bg-black/[0.02]">
            <div>
              <p className="font-medium text-brand-dark">{c.title}</p>
              <p className="text-xs text-foreground/50">{NIVEAU_LABELS[c.niveau]} · {c.matiere}</p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                c.status === "PUBLIE" ? "bg-green-50 text-green-700" : c.status === "EN_RELECTURE" ? "bg-gold/15 text-gold" : "bg-black/5 text-foreground/60"
              }`}
            >
              {STATUS_LABELS[c.status]}
            </span>
          </Link>
        ))}
        {courses.length === 0 && <p className="p-6 text-foreground/60">Vous n&apos;avez pas encore créé de cours.</p>}
      </div>
    </div>
  );
}
