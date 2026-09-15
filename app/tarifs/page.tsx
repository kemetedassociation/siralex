import Link from "next/link";
import { PLANS } from "@/lib/access";
import { getSession } from "@/lib/session";

export default async function TarifsPage() {
  const session = await getSession();
  const target = session?.user ? "/abonnement" : "/inscription";

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Formules et tarifs</h1>
      <p className="mt-1 text-foreground/60">Passez à une formule supérieure à tout moment.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(PLANS) as [string, (typeof PLANS)[keyof typeof PLANS]][])
          .filter(([key]) => key !== "INSTITUTIONNELLE")
          .map(([key, p]) => (
            <div key={key} className="flex flex-col rounded-lg border border-black/10 bg-white p-5">
              <h3 className="font-semibold text-brand-dark">{p.label}</h3>
              <p className="mt-2 text-2xl font-semibold text-brand-dark">
                {p.price === 0 ? "Gratuit" : `${p.price.toLocaleString("fr-FR")} FCFA`}
                {p.price > 0 && <span className="text-sm font-normal text-foreground/50">/mois</span>}
              </p>
              <p className="mt-3 flex-1 text-sm text-foreground/70">{p.description}</p>
              <Link
                href={target}
                className="mt-4 rounded bg-brand px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-dark"
              >
                Choisir
              </Link>
            </div>
          ))}
      </div>

      <div className="mt-8 rounded-lg border border-gold/40 bg-gold/10 p-5">
        <h3 className="font-semibold text-brand-dark">Licence institutionnelle</h3>
        <p className="mt-1 text-sm text-foreground/70">
          Pour les universités, cabinets et administrations : accès pour un groupe d&apos;utilisateurs,
          statistiques d&apos;usage et support dédié. Contactez l&apos;équipe SiraLex pour un devis.
        </p>
      </div>
    </div>
  );
}
