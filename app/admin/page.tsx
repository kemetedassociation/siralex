import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function AdminHome() {
  await requireRole(["ADMIN"]);

  const [users, coursesToReview, examsToReview, openReports, pendingOffers, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.course.count({ where: { status: "EN_RELECTURE" } }),
    prisma.exam.count({ where: { status: "EN_RELECTURE" } }),
    prisma.report.count({ where: { status: "OUVERT" } }),
    prisma.careerOffer.count({ where: { status: "EN_ATTENTE" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "REUSSI" } }),
  ]);

  const cards = [
    { label: "Utilisateurs", value: users, href: "/admin/utilisateurs" },
    { label: "Cours en relecture", value: coursesToReview, href: "/admin/cours" },
    { label: "Épreuves en relecture", value: examsToReview, href: "/admin/examens" },
    { label: "Signalements ouverts", value: openReports, href: "/admin/moderation" },
    { label: "Offres en attente", value: pendingOffers, href: "/admin/carrieres" },
    { label: "Revenus cumulés (FCFA)", value: (revenue._sum.amount ?? 0).toLocaleString("fr-FR"), href: "/abonnement" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Administration</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="rounded-lg border border-black/10 bg-white p-5 hover:border-brand">
            <p className="text-2xl font-semibold text-brand-dark">{c.value}</p>
            <p className="mt-1 text-sm text-foreground/60">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
