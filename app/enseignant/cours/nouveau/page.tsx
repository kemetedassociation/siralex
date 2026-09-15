import { createCourse } from "@/lib/actions/courses";
import { requireRole } from "@/lib/session";
import { NIVEAU_LABELS } from "@/lib/labels";

export default async function NouveauCoursPage() {
  await requireRole(["ENSEIGNANT", "ADMIN"]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Nouveau cours</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Le cours sera soumis au comité scientifique avant publication.
      </p>

      <form action={createCourse} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80">Titre</label>
          <input name="title" required className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground/80">Niveau</label>
            <select name="niveau" className="mt-1 w-full rounded border border-black/15 px-3 py-2">
              {Object.entries(NIVEAU_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">Matière</label>
            <input name="matiere" required className="mt-1 w-full rounded border border-black/15 px-3 py-2" placeholder="Droit civil" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground/80">Filière</label>
            <input name="filiere" className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">Université d&apos;origine</label>
            <input name="universite" className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Résumé</label>
          <textarea name="summary" required rows={2} className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Contenu du cours</label>
          <textarea name="content" required rows={14} className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Durée de lecture estimée (minutes)</label>
          <input type="number" name="durationMin" defaultValue={30} min={5} className="mt-1 w-32 rounded border border-black/15 px-3 py-2" />
        </div>
        <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
          Soumettre pour relecture
        </button>
      </form>
    </div>
  );
}
