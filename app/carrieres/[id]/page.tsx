import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { OFFER_TYPE_LABELS } from "@/lib/labels";
import { applyToOffer } from "@/lib/actions/careers";

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await prisma.careerOffer.findUnique({ where: { id }, include: { author: true } });
  if (!offer) notFound();

  const session = await getSession();
  let alreadyApplied = false;
  if (session?.user) {
    alreadyApplied = !!(await prisma.application.findUnique({
      where: { offerId_userId: { offerId: id, userId: session.user.id } },
    }));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/carrieres" className="text-sm text-brand hover:underline">
        ← Retour aux offres
      </Link>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">{OFFER_TYPE_LABELS[offer.type]}</span>
        <span className="text-foreground/50">{offer.organisation}</span>
      </div>

      <h1 className="mt-3 font-serif text-2xl font-semibold text-brand-dark">{offer.title}</h1>
      <p className="mt-4 whitespace-pre-line text-sm text-foreground/80">{offer.description}</p>

      <div className="mt-8 rounded border border-black/10 bg-white p-5">
        {!session?.user && (
          <p className="text-sm text-foreground/60">
            <Link href="/connexion" className="text-brand hover:underline">Connectez-vous</Link> pour postuler.
          </p>
        )}
        {session?.user && alreadyApplied && (
          <p className="text-sm font-medium text-green-700">Candidature envoyée ✓</p>
        )}
        {session?.user && !alreadyApplied && (
          <form action={applyToOffer} className="space-y-3">
            <input type="hidden" name="offerId" value={offer.id} />
            <label className="block text-sm font-medium text-foreground/80">Message de motivation</label>
            <textarea name="message" rows={4} required className="w-full rounded border border-black/15 px-3 py-2" />
            <button className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
              Postuler / demander une mise en relation
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
