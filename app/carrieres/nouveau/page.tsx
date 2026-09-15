import { submitOffer } from "@/lib/actions/careers";
import { requireRole } from "@/lib/session";
import { OFFER_TYPE_LABELS } from "@/lib/labels";

export default async function NouvelleOffrePage() {
  await requireRole(["ENSEIGNANT", "PROFESSIONNEL", "INSTITUTION", "ADMIN"]);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Publier une offre</h1>
      <p className="mt-1 text-sm text-foreground/60">L&apos;offre sera examinée par l&apos;équipe SiraLex avant publication.</p>

      <form action={submitOffer} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80">Type</label>
          <select name="type" className="mt-1 w-full rounded border border-black/15 px-3 py-2">
            {Object.entries(OFFER_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Organisation</label>
          <input name="organisation" required className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Titre</label>
          <input name="title" required className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Description</label>
          <textarea name="description" required rows={6} className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">Soumettre</button>
      </form>
    </div>
  );
}
