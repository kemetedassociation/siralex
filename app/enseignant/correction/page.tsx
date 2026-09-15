import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export default async function CorrectionListPage() {
  const user = await requireRole(["ENSEIGNANT", "ADMIN"]);

  const submissions = await prisma.examSubmission.findMany({
    where: {
      status: "SOUMISE",
      exam: user.role === "ADMIN" ? {} : { authorId: user.id },
    },
    include: { exam: true, student: true },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-2xl font-semibold text-brand-dark">Copies à corriger</h1>

      <div className="mt-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {submissions.map((s) => (
          <Link key={s.id} href={`/enseignant/correction/${s.id}`} className="flex items-center justify-between p-4 hover:bg-black/[0.02]">
            <div>
              <p className="font-medium text-brand-dark">{s.exam.title}</p>
              <p className="text-xs text-foreground/50">
                {s.student.name} · soumise le {s.submittedAt?.toLocaleString("fr-FR")}
              </p>
            </div>
            <span className="rounded bg-gold/15 px-2 py-0.5 text-xs font-medium text-gold">À corriger</span>
          </Link>
        ))}
        {submissions.length === 0 && <p className="p-6 text-foreground/60">Aucune copie en attente.</p>}
      </div>
    </div>
  );
}
