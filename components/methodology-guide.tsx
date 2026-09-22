import type { GuideContent } from "@/lib/methodology-content";

export function MethodologyGuideView({ guide }: { guide: GuideContent }) {
  return (
    <article className="prose-course max-w-none text-foreground/90">
      {guide.sections.map((section, i) => {
        const Tag = section.level === 1 ? "h2" : "h3";
        return (
          <div key={i} className="mt-6">
            <Tag
              className={
                section.level === 1
                  ? "font-serif text-xl font-semibold text-brand-dark"
                  : "font-serif text-lg font-semibold text-brand-dark"
              }
            >
              {section.heading}
            </Tag>
            {section.blocks.map((block, j) =>
              block.type === "p" ? (
                <p key={j} className="mt-2 leading-relaxed">
                  {block.text}
                </p>
              ) : (
                <ul key={j} className="mt-2 list-disc space-y-1 pl-5">
                  {block.items.map((item, k) => (
                    <li key={k}>{item}</li>
                  ))}
                </ul>
              )
            )}
          </div>
        );
      })}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-green-600/20 bg-green-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-800">À faire</p>
          <ul className="mt-2 space-y-1.5 text-sm text-green-900">
            {guide.faire.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden>✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-red-600/20 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-800">À ne pas faire</p>
          <ul className="mt-2 space-y-1.5 text-sm text-red-900">
            {guide.nePasFaire.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden>✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
