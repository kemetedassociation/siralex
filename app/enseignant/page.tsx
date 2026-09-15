import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function EnseignantHome() {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);

  const [courses, exams, pendingCorrections] = await Promise.all([
    prisma.course.count({ where: { authorId: user.id } }),
    prisma.exam.count({ where: { authorId: user.id } }),
    prisma.examSubmission.count({ where: { status: "SOUMISE", exam: { authorId: user.id } } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-dark">Espace enseignant</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/enseignant/cours" className="rounded-lg border border-black/10 bg-white p-5 hover:border-brand">
          <p className="text-2xl font-semibold text-brand-dark">{courses}</p>
          <p className="mt-1 text-sm text-foreground/60">Cours publiés / en relecture</p>
        </Link>
        <Link href="/enseignant/examens" className="rounded-lg border border-black/10 bg-white p-5 hover:border-brand">
          <p className="text-2xl font-semibold text-brand-dark">{exams}</p>
          <p className="mt-1 text-sm text-foreground/60">Épreuves créées</p>
        </Link>
        <Link href="/enseignant/correction" className="rounded-lg border border-black/10 bg-white p-5 hover:border-brand">
          <p className="text-2xl font-semibold text-brand-dark">{pendingCorrections}</p>
          <p className="mt-1 text-sm text-foreground/60">Copies à corriger</p>
        </Link>
      </div>
    </div>
  );
}
