import { createThread } from "@/lib/actions/community";
import { requireUser } from "@/lib/session";

export default async function NouveauFilPage() {
  await requireUser();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Nouveau fil de discussion</h1>

      <form action={createThread} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/80">Titre</label>
          <input name="title" required className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground/80">Matière</label>
            <input name="matiere" className="mt-1 w-full rounded border border-black/15 px-3 py-2" placeholder="Droit des obligations" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">Promotion</label>
            <input name="promotion" className="mt-1 w-full rounded border border-black/15 px-3 py-2" placeholder="L2 2026" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/80">Message</label>
          <textarea name="content" required rows={6} className="mt-1 w-full rounded border border-black/15 px-3 py-2" />
        </div>
        <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">Publier</button>
      </form>
    </div>
  );
}
