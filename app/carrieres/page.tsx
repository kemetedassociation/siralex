import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { OFFER_TYPE_LABELS } from "@/lib/labels";

export default async function CarrieresPage() {
  const session = await getSession();
  const canPublish = session?.user && ["ENSEIGNANT", "PROFESSIONNEL", "INSTITUTION", "ADMIN"].includes(session.user.role);

  const offers = await prisma.careerOffer.findMany({
    where: { status: "VALIDEE" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-brand-dark">Espace carrières</h1>
          <p className="mt-1 text-foreground/60">Stages, emplois et mentorat.</p>
        </div>
        {canPublish && (
          <Link href="/carrieres/nouveau" className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Publier une offre
          </Link>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {offers.map((o) => (
          <Link key={o.id} href={`/carrieres/${o.id}`} className="card-lift block rounded-lg border border-black/10 bg-white p-4 hover:border-brand">
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">{OFFER_TYPE_LABELS[o.type]}</span>
              <span className="text-foreground/50">{o.organisation}</span>
            </div>
            <h3 className="mt-1 font-semibold text-brand-dark">{o.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-foreground/60">{o.description}</p>
          </Link>
        ))}
        {offers.length === 0 && <p className="text-foreground/60">Aucune offre publiée pour le moment.</p>}
      </div>
    </div>
  );
}
