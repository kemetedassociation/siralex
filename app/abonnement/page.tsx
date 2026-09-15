import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PLANS, type FormuleKey } from "@/lib/access";
import { PaymentForm } from "@/components/payment-form";

export default async function AbonnementPage() {
  const user = await requireUser();

  const subscription = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, plan: "GRATUITE", status: "ACTIF" },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 10 } },
  });

  const plan = subscription.plan as FormuleKey;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Mon abonnement</h1>

      <div className="mt-4 rounded border border-black/10 bg-white p-4 text-sm">
        <p>
          Formule actuelle : <span className="font-medium text-brand-dark">{PLANS[plan].label}</span>
        </p>
        <p className="mt-1 text-foreground/60">
          Statut :{" "}
          {subscription.status === "ACTIF" ? (
            <span className="text-green-700">Actif</span>
          ) : (
            <span className="text-red-600">Suspendu — paiement requis</span>
          )}
        </p>
        {subscription.renewsAt && (
          <p className="mt-1 text-foreground/60">
            Prochain renouvellement : {subscription.renewsAt.toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-lg font-semibold text-brand-dark">Changer de formule</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Le nouveau tarif s&apos;applique immédiatement après confirmation du paiement.
        </p>
        <div className="mt-4 rounded border border-black/10 bg-white p-5">
          <PaymentForm currentPlan={plan} />
        </div>
      </div>

      {subscription.payments.length > 0 && (
        <div className="mt-8">
          <h2 className="font-serif text-lg font-semibold text-brand-dark">Historique des paiements</h2>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {subscription.payments.map((p) => (
                <tr key={p.id} className="border-t border-black/10">
                  <td className="py-2 text-foreground/60">{p.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td className="py-2">{p.method}</td>
                  <td className="py-2">{p.amount.toLocaleString("fr-FR")} FCFA</td>
                  <td className={`py-2 font-medium ${p.status === "REUSSI" ? "text-green-700" : "text-red-600"}`}>
                    {p.status === "REUSSI" ? "Réussi" : "Échec"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
