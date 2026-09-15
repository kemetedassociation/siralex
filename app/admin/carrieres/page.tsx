import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { OFFER_TYPE_LABELS } from "@/lib/labels";
import { decideOffer } from "@/lib/actions/careers";

export default async function AdminCarrieresPage() {
  await requireRole(["ADMIN"]);

  const offers = await prisma.careerOffer.findMany({
    where: { status: "EN_ATTENTE" },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Offres en attente</h1>

      <div className="mt-6 space-y-4">
        {offers.map((o) => (
          <div key={o.id} className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-brand-dark">{o.title}</p>
                <p className="text-xs text-foreground/50">
                  {OFFER_TYPE_LABELS[o.type]} · {o.organisation} · par {o.author.name}
                </p>
              </div>
              <div className="flex gap-2">
                <form action={decideOffer}>
                  <input type="hidden" name="offerId" value={o.id} />
                  <input type="hidden" name="decision" value="rejeter" />
                  <button className="rounded border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5">Rejeter</button>
                </form>
                <form action={decideOffer}>
                  <input type="hidden" name="offerId" value={o.id} />
                  <input type="hidden" name="decision" value="valider" />
                  <button className="rounded bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark">Valider</button>
                </form>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-foreground/70">{o.description}</p>
          </div>
        ))}
        {offers.length === 0 && <p className="text-foreground/60">Aucune offre en attente.</p>}
      </div>
    </div>
  );
}
