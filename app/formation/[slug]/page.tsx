import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NIVEAU_LABELS, PROGRESS_LABELS } from "@/lib/labels";
import { canAccessCourse, PLANS, type FormuleKey } from "@/lib/access";
import { markCourseCompleted } from "@/lib/actions/progress";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { author: true },
  });
  if (!course || course.status !== "PUBLIE") notFound();

  const session = await getSession();
  let plan: FormuleKey = "GRATUITE";
  let progress = null;

  if (session?.user) {
    const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
    if (sub) plan = sub.plan as FormuleKey;

    progress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });

    const accessible = canAccessCourse(plan, course.niveau);
    if (accessible && (!progress || progress.status === "NON_COMMENCE")) {
      progress = await prisma.courseProgress.upsert({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        update: { status: "EN_COURS" },
        create: { userId: session.user.id, courseId: course.id, status: "EN_COURS", lastPosition: 5 },
      });
    }
  }

  const accessible = canAccessCourse(plan, course.niveau);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/formation" className="text-sm text-brand hover:underline">
        ← Retour au catalogue
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">
          {NIVEAU_LABELS[course.niveau]}
        </span>
        <span className="text-foreground/50">{course.matiere}</span>
        {course.universite && <span className="text-foreground/50">· {course.universite}</span>}
      </div>

      <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-dark">{course.title}</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Par {course.author.name} · {course.durationMin} min de lecture
        {progress && ` · ${PROGRESS_LABELS[progress.status]}`}
      </p>

      {!session?.user && (
        <div className="mt-8 rounded border border-gold/40 bg-gold/10 p-4 text-sm">
          <Link href="/connexion" className="font-medium text-brand hover:underline">
            Connectez-vous
          </Link>{" "}
          pour suivre votre progression sur ce cours.
        </div>
      )}

      {session?.user && !accessible ? (
        <div className="mt-8 rounded border border-gold/40 bg-gold/10 p-6 text-sm">
          <p className="font-medium text-brand-dark">
            Ce cours nécessite la formule {PLANS[requiredPlanFor(course.niveau)].label}.
          </p>
          <p className="mt-1 text-foreground/70">
            Passez à une formule supérieure pour accéder à l&apos;intégralité du contenu.
          </p>
          <Link
            href="/tarifs"
            className="mt-3 inline-block rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark"
          >
            Voir les formules
          </Link>
        </div>
      ) : (
        <article className="prose-course mt-8 max-w-none whitespace-pre-line text-foreground/90">
          {course.content}
        </article>
      )}

      {session?.user && accessible && (
        <form action={markCourseCompleted} className="mt-10 border-t border-black/10 pt-6">
          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="slug" value={course.slug} />
          {progress?.status === "TERMINE" ? (
            <p className="text-sm font-medium text-green-700">Cours terminé ✓</p>
          ) : (
            <button className="rounded bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark">
              Marquer comme terminé
            </button>
          )}
        </form>
      )}
    </div>
  );
}

function requiredPlanFor(niveau: string): FormuleKey {
  return niveau === "M1" || niveau === "M2" ? "MASTER" : "LICENCE";
}
