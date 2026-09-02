import type { Testimonial } from "../api/testimonials";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

/**
 * Carte de témoignage centrée, posée sur la bande beige de la page d'accueil.
 *
 * Deux éléments seulement : la parole, puis qui l'a dite. Ni photo de profil,
 * ni initiales, ni mention de ville - ces ornements attirent l'œil avant le
 * texte alors que c'est le texte qui convainc, et une pastille d'initiales
 * fabriquée par le code ressemble à un avatar générique de plus.
 *
 * Le fond de la carte est `cream` alors que la bande est `cream-tint` : c'est
 * ce demi-ton d'écart qui détache la carte, sans trait de contour ni ombre
 * appuyée. Le texte n'est entouré d'aucun guillemet ajoute par le code - les
 * mots affichés sont exactement ceux saisis au back-office.
 *
 * Composant purement presentationnel : aucune logique de données ici.
 */
export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { author, text } = testimonial;

  return (
    <figure className="flex h-full flex-col items-center rounded-xl bg-cream px-6 py-8 text-center shadow-[0_18px_40px_-30px_rgba(15,15,15,0.55)] md:px-8 md:py-10">
      <blockquote className="flex-1 text-sm leading-relaxed text-anthracite">{text}</blockquote>
      <figcaption className="serif mt-7 text-base text-ink">{author}</figcaption>
    </figure>
  );
}
