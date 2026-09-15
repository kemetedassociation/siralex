"use client";

import { useActionState, useState } from "react";
import { choosePlan } from "@/lib/actions/subscription";
import { PLANS, type FormuleKey } from "@/lib/access";

const CHOOSABLE = ["GRATUITE", "LICENCE", "MASTER", "PROFESSIONNEL"] as const;

export function PaymentForm({ currentPlan }: { currentPlan: FormuleKey }) {
  const [state, formAction, pending] = useActionState(choosePlan, null);
  const [plan, setPlan] = useState<FormuleKey>(currentPlan === "GRATUITE" ? "LICENCE" : currentPlan);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground/80">Formule</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHOOSABLE.map((key) => (
            <label
              key={key}
              className={`cursor-pointer rounded border px-2 py-2 text-center text-sm ${
                plan === key ? "border-brand bg-brand/5 font-medium text-brand" : "border-black/15"
              }`}
            >
              <input type="radio" name="plan" value={key} checked={plan === key} onChange={() => setPlan(key)} className="sr-only" />
              {PLANS[key].label}
              <div className="text-xs font-normal text-foreground/50">
                {PLANS[key].price === 0 ? "Gratuit" : `${PLANS[key].price.toLocaleString("fr-FR")} FCFA`}
              </div>
            </label>
          ))}
        </div>
      </div>

      {plan !== "GRATUITE" && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground/80">Moyen de paiement</label>
            <select name="method" className="mt-1 w-full rounded border border-black/15 px-3 py-2">
              <option value="ORANGE_MONEY">Orange Money</option>
              <option value="WAVE">Wave</option>
              <option value="CARTE">Carte bancaire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80">Code de confirmation</label>
            <input
              name="code"
              placeholder="Code reçu par SMS (démo : tout code fonctionne, sauf 0000)"
              className="mt-1 w-full rounded border border-black/15 px-3 py-2"
            />
          </div>
        </>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Abonnement mis à jour avec succès.</p>}

      <button disabled={pending} className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Traitement…" : plan === "GRATUITE" ? "Repasser à la formule gratuite" : "Confirmer et payer"}
      </button>
    </form>
  );
}
