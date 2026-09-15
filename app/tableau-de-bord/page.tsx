import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { NIVEAU_LABELS, PROGRESS_LABELS } from "@/lib/labels";
import { PLANS, type FormuleKey } from "@/lib/access";

export default async function TableauDeBordPage() {
  const user = await requireUser();

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "ENSEIGNANT") redirect("/enseignant");

  const [inProgress, subscription, examSubmissions, applications, favorites] = await Promise.all([
    prisma.courseProgress.findMany({
      where: { userId: user.id, status: "EN_COURS" },
      include: { course: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.examSubmission.findMany({
      where: { studentId: user.id },
      include: { exam: true },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    prisma.application.findMany({
      where: { userId: user.id },
      include: { offer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.favorite.count({ where: { userId: user.id } }),
  ]);

  const plan = (subscription?.plan ?? "GRATUITE") as FormuleKey;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Bonjour {user.name}</h1>
      <p className="mt-1 text-foreground/60">
        {user.niveau && `${NIVEAU_LABELS[user.niveau]} · `}Formule {PLANS[plan].label}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-dark">Reprendre un cours</h2>
            <Link href="/formation" className="text-sm text-brand hover:underline">Catalogue</Link>
          </div>
          <div className="mt-3 space-y-2">
            {inProgress.map((p) => (
              <Link key={p.id} href={`/formation/${p.course.slug}`} className="block rounded border border-black/10 p-3 hover:border-brand">
                <p className="font-medium text-brand-dark">{p.course.title}</p>
                <p className="text-xs text-foreground/50">{PROGRESS_LABELS[p.status]}</p>
              </Link>
            ))}
            {inProgress.length === 0 && <p className="text-sm text-foreground/50">Aucun cours en cours.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-dark">Mes examens</h2>
            <Link href="/examens" className="text-sm text-brand hover:underline">Voir tout</Link>
          </div>
          <div className="mt-3 space-y-2">
            {examSubmissions.map((s) => (
              <Link key={s.id} href={`/examens/${s.examId}/${s.status === "EN_COURS" ? "composer" : "resultat"}`} className="block rounded border border-black/10 p-3 hover:border-brand">
                <p className="font-medium text-brand-dark">{s.exam.title}</p>
                <p className="text-xs text-foreground/50">
                  {s.status === "EN_COURS" && "En cours"}
                  {s.status === "SOUMISE" && "En attente de correction"}
                  {s.status === "CORRIGEE" && `Note : ${s.note?.toFixed(2)}/20`}
                </p>
              </Link>
            ))}
            {examSubmissions.length === 0 && <p className="text-sm text-foreground/50">Aucune épreuve composée.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-brand-dark">Mes candidatures</h2>
            <Link href="/carrieres" className="text-sm text-brand hover:underline">Espace carrières</Link>
          </div>
          <div className="mt-3 space-y-2">
            {applications.map((a) => (
              <Link key={a.id} href={`/carrieres/${a.offerId}`} className="block rounded border border-black/10 p-3 hover:border-brand">
                <p className="font-medium text-brand-dark">{a.offer.title}</p>
                <p className="text-xs text-foreground/50">{a.offer.organisation}</p>
              </Link>
            ))}
            {applications.length === 0 && <p className="text-sm text-foreground/50">Aucune candidature envoyée.</p>}
          </div>
        </section>

        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="font-semibold text-brand-dark">Mon abonnement</h2>
          <p className="mt-2 text-sm text-foreground/70">
            {favorites} texte{favorites > 1 ? "s" : ""} en favoris.
          </p>
          <Link href="/abonnement" className="mt-3 inline-block rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
            Gérer mon abonnement
          </Link>
        </section>
      </div>
    </div>
  );
}
