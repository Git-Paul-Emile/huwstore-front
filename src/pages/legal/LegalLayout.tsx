import type { ReactNode } from "react";

/**
 * Gabarit commun aux pages d'information (conditions, confidentialité, contact).
 * Mesure de ligne volontairement courte : ces textes se lisent, ils ne se
 * survolent pas.
 */
export function LegalPage({ title, updatedAt, children }: { title: string; updatedAt: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-[70ch] px-5 py-12 md:px-10 md:py-20">
      <header className="border-b border-taupe/25 pb-6">
        <p className="label-lux text-taupe">Informations</p>
        <h1 className="serif mt-2 text-2xl md:text-4xl">{title}</h1>
        <p className="mt-3 text-xs text-taupe">Dernière mise à jour : {updatedAt}</p>
      </header>
      <div className="prose-legal mt-8 flex flex-col gap-6 text-justify text-sm leading-relaxed text-anthracite">{children}</div>
    </article>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="serif text-lg text-ink">{title}</h2>
      {children}
    </section>
  );
}
