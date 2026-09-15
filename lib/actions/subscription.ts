"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PLANS, type FormuleKey } from "@/lib/access";

export type PaymentState = { error?: string; success?: boolean } | null;

/**
 * Simule une passerelle de paiement (Mobile Money / carte). En l'absence
 * d'intégration réelle, la transaction est considérée réussie sauf si
 * l'utilisateur saisit volontairement "0000" comme code, ce qui permet de
 * démontrer le parcours d'échec décrit au cahier des charges (étape 26).
 */
export async function choosePlan(_prev: PaymentState, formData: FormData): Promise<PaymentState> {
  const user = await requireUser();
  const plan = String(formData.get("plan")) as FormuleKey;
  const method = String(formData.get("method"));
  const code = String(formData.get("code") ?? "");

  if (!(plan in PLANS)) return { error: "Formule invalide." };

  const sub = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, plan: "GRATUITE", status: "ACTIF" },
  });

  if (plan === "GRATUITE") {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { plan: "GRATUITE", status: "ACTIF", renewsAt: null },
    });
    revalidatePath("/abonnement");
    return { success: true };
  }

  const amount = PLANS[plan].price;
  const failed = code === "0000";

  await prisma.payment.create({
    data: {
      subscriptionId: sub.id,
      amount,
      method,
      status: failed ? "ECHEC" : "REUSSI",
    },
  });

  if (failed) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "SUSPENDU" },
    });
    revalidatePath("/abonnement");
    return { error: "Paiement refusé par l'émetteur. Votre accès reste sur la formule actuelle." };
  }

  const renewsAt = new Date();
  renewsAt.setDate(renewsAt.getDate() + 30);

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { plan, status: "ACTIF", paymentMethod: method, renewsAt },
  });

  revalidatePath("/abonnement");
  return { success: true };
}
