import type { Testimonial } from "../api/testimonials";

/**
 * Initiales de secours lorsqu'aucun avatar n'est renseigne.
 * "Awa Diop" -> "AD"
 */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

type TestimonialCardProps = {
  testimonial: Testimonial;
};

/**
 * Carte de temoignage "encochee" : le bloc auteur est pose dans une decoupe
 * en bas a gauche de la carte. La forme est obtenue avec deux surfaces
 * (le corps + un remplisseur a droite du pied) et un raccord concave en CSS
 * (classe `.notch-fill`, definie dans index.css).
 *
 * Composant purement presentational : aucune logique de donnees ici.
 */
export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { author, role, text, avatar } = testimonial;

  return (
    <figure className="flex h-full flex-col">
      {/* Corps de la carte : coin bas-droit carre pour se souder au pied */}
      <div className="flex flex-1 flex-col rounded-3xl rounded-br-none bg-cream px-6 pb-9 pt-6 md:px-7 md:pt-7">
        <span aria-hidden="true" className="serif text-5xl leading-none text-taupe/45">
          &ldquo;
        </span>
        <blockquote className="mt-1 text-sm leading-relaxed text-anthracite">{text}</blockquote>
      </div>

      {/* Pied : l'auteur occupe l'encoche, le remplisseur reprend le fond de la carte */}
      <figcaption className="flex items-stretch">
        <div className="flex items-center gap-3 py-3 pr-6">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="label-lux grid h-12 w-12 shrink-0 place-items-center rounded-full bg-taupe-soft text-ink"
            >
              {initials(author)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{author}</p>
            <p className="label-lux mt-0.5 truncate text-taupe">{role}</p>
          </div>
        </div>

        <div className="notch-fill flex-1 rounded-b-3xl rounded-tr-none bg-cream" />
      </figcaption>
    </figure>
  );
}
