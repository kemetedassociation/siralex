import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { NIVEAU_LABELS } from "@/lib/labels";
import { METHODOLOGY_TYPES_BY_SLUG, parseGuideContent } from "@/lib/methodology-content";
import { MethodologyGuideView } from "@/components/methodology-guide";
import { saveMethodologyResponse, analyzeMethodologyResponseAction } from "@/lib/actions/methodology";
import type { ChecklistCheck } from "@/lib/methodology-scoring";

export default async function MethodologieGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const type = METHODOLOGY_TYPES_BY_SLUG[slug];
  if (!type) notFound();

  const guide = await prisma.methodologyGuide.findUnique({
    where: { type },
    include: { exercises: { orderBy: { createdAt: "asc" } } },
  });
  if (!guide) notFound();

  const session = await getSession();
  const responses = session?.user
    ? await prisma.methodologyResponse.findMany({
        where: { userId: session.user.id, exerciseId: { in: guide.exercises.map((e) => e.id) } },
      })
    : [];
  const responseByExercise = new Map(responses.map((r) => [r.exerciseId, r]));

  const content = parseGuideContent(guide.content);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/methodologie" className="text-sm text-brand hover:underline">
        ← Retour à la méthodologie
      </Link>

      <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-dark">{guide.title}</h1>
      <p className="mt-1 text-foreground/60">{guide.subtitle}</p>

      <MethodologyGuideView guide={content} />

      {guide.exercises.length > 0 && (
        <div className="mt-12 border-t border-black/10 pt-8">
          <h2 className="font-serif text-2xl font-semibold text-brand-dark">S&apos;entraîner</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Rédigez votre réponse, enregistrez-la à tout moment, puis demandez une analyse
            méthodologique. Elle vérifie le respect des règles de méthode ci-dessus (structure,
            vocabulaire, éléments attendus) — elle ne juge pas l&apos;exactitude juridique du fond, qui
            reste du ressort d&apos;un enseignant.
          </p>

          <div className="mt-6 space-y-10">
            {guide.exercises.map((exercise) => {
              const response = responseByExercise.get(exercise.id);
              const checks: ChecklistCheck[] = response?.feedback ? JSON.parse(response.feedback) : [];

              return (
                <div key={exercise.id} className="rounded-lg border border-black/10 bg-white p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {exercise.niveau && (
                      <span className="rounded bg-brand/10 px-2 py-0.5 font-medium text-brand">
                        {NIVEAU_LABELS[exercise.niveau]}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-serif text-lg font-semibold text-brand-dark">
                    {exercise.title}
                  </h3>
                  <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground/90">
                    {exercise.prompt}
                  </p>

                  {exercise.support && (
                    <blockquote className="mt-4 whitespace-pre-line rounded border-l-4 border-gold bg-gold/10 p-4 text-sm leading-relaxed text-foreground/80">
                      {exercise.support}
                    </blockquote>
                  )}

                  {!session?.user ? (
                    <p className="mt-5 rounded border border-gold/40 bg-gold/10 p-4 text-sm">
                      <Link href="/connexion" className="font-medium text-brand hover:underline">
                        Connectez-vous
                      </Link>{" "}
                      pour rédiger et sauvegarder votre réponse à cet exercice.
                    </p>
                  ) : (
                    <form className="mt-5 space-y-3">
                      <input type="hidden" name="exerciseId" value={exercise.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <textarea
                        name="content"
                        rows={14}
                        defaultValue={response?.content ?? ""}
                        placeholder="Rédigez votre réponse ici…"
                        className="w-full rounded border border-black/15 px-3 py-2 text-sm leading-relaxed"
                      />
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          formAction={saveMethodologyResponse}
                          className="rounded border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5"
                        >
                          Enregistrer ma réponse
                        </button>
                        <button
                          formAction={analyzeMethodologyResponseAction}
                          className="rounded bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                        >
                          Analyser ma réponse
                        </button>
                        {response?.updatedAt && (
                          <span className="text-xs text-foreground/40">
                            Dernier enregistrement le {response.updatedAt.toLocaleDateString("fr-FR")} à{" "}
                            {response.updatedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </form>
                  )}

                  {response?.score !== null && response?.score !== undefined && (
                    <div className="mt-6 rounded-lg border border-black/10 bg-black/[0.03] p-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-2xl font-serif font-bold ${
                            response.score >= 70
                              ? "text-green-700"
                              : response.score >= 40
                                ? "text-gold"
                                : "text-red-700"
                          }`}
                        >
                          {response.score}%
                        </span>
                        <span className="text-sm text-foreground/60">de respect de la méthode</span>
                      </div>
                      <ul className="mt-3 space-y-1.5 text-sm">
                        {checks.map((c) => (
                          <li key={c.key} className="flex gap-2">
                            <span aria-hidden className={c.passed ? "text-green-700" : "text-red-700"}>
                              {c.passed ? "✓" : "✗"}
                            </span>
                            <span className={c.passed ? "text-foreground/80" : "text-foreground/60"}>
                              {c.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
