import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { NIVEAU_LABELS } from "@/lib/labels";
import { updateCourse } from "@/lib/actions/courses";

const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_RELECTURE: "En relecture",
  PUBLIE: "Publié",
};

export default async function EditCoursPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: { versions: { orderBy: { createdAt: "desc" }, include: { editedBy: true } } },
  });
  if (!course) notFound();
  if (course.authorId !== user.id && user.role !== "ADMIN") redirect("/enseignant/cours");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-brand-dark">{course.title}</h1>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            course.status === "PUBLIE" ? "bg-green-50 text-green-700" : course.status === "EN_RELECTURE" ? "bg-gold/15 text-gold" : "bg-black/5 text-foreground/60"
          }`}
        >
          {STATUS_LABELS[course.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-foreground/60">{NIVEAU_LABELS[course.niveau]} · {course.matiere}</p>

      <form action={updateCourse} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={course.id} />
        <div>
          <label className="block text-sm font-medium text-foreground/80">Résumé</label>
          <textarea name="summary" defaultValue={course.summary} rows={2} className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Contenu</label>
          <textarea name="content" defaultValue={course.content} rows={14} className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <p className="text-xs text-foreground/50">
          Toute modification renvoie le cours en relecture avant republication.
        </p>
        <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
          Enregistrer et soumettre pour relecture
        </button>
      </form>

      <div className="mt-8 border-t border-black/10 pt-4">
        <h2 className="font-semibold text-brand-dark">Historique des versions</h2>
        <ul className="mt-2 space-y-1 text-sm text-foreground/60">
          {course.versions.map((v) => (
            <li key={v.id}>
              {v.createdAt.toLocaleString("fr-FR")} — modifié par {v.editedBy.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
