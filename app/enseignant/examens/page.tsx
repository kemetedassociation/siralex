import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { EXAM_TYPE_LABELS, NIVEAU_LABELS } from "@/lib/labels";

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_RELECTURE: "En relecture",
  PUBLIE: "Publié",
};

export default async function EnseignantExamensPage() {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);
  const exams = await prisma.exam.findMany({ where: { authorId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-brand-dark">Mes épreuves</h1>
        <Link href="/enseignant/examens/nouveau" className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Nouvelle épreuve
        </Link>
      </div>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {exams.map((e) => (
          <Link key={e.id} href={`/enseignant/examens/${e.id}`} className="flex items-center justify-between p-4 hover:bg-black/[0.02]">
            <div>
              <p className="font-medium text-brand-dark">{e.title}</p>
              <p className="text-xs text-foreground/50">
                {EXAM_TYPE_LABELS[e.type]} · {NIVEAU_LABELS[e.niveau]}
              </p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                e.status === "PUBLIE" ? "bg-green-50 text-green-700" : e.status === "EN_RELECTURE" ? "bg-gold/15 text-gold" : "bg-black/5 text-foreground/60"
              }`}
            >
              {STATUS_LABELS[e.status]}
            </span>
          </Link>
        ))}
        {exams.length === 0 && <p className="p-6 text-foreground/60">Aucune épreuve créée.</p>}
      </div>
    </div>
  );
}
