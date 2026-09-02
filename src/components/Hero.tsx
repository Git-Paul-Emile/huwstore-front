import { Link } from "react-router-dom";
import { useLayoutStore } from "../store/useLayoutStore";
import { ArrowRight } from "./icons";

/**
 * Bloc d'accueil.
 *
 * Pas de photo en arrière-plan : une image de fond impose un voile pour rester
 * lisible, et ce voile change de rendu à chaque visuel chargé. Ici le fond est
 * un aplat blanc cassé, le contraste du texte est donc constant, le premier
 * affichage ne dépend d'aucun téléchargement d'image, et rien ne vient
 * concurrencer les photos de sacs qui suivent juste en dessous.
 *
 * Le contenu est fixe et vit dans le code : c'est la promesse de la boutique,
 * pas une campagne. Les campagnes se pilotent depuis le back-office et
 * s'affichent dans le bandeau promo, plus bas dans la page.
 */
export default function Hero() {
  // Hauteur mesurée en temps réel par Header (bandeau d'annonce compris) :
  // le bloc occupe une bonne moitié de l'écran sans jamais le remplir, ce qui
  // laisse apparaître le haut de la section suivante et signale qu'il y a du
  // contenu à faire défiler.
  const headerHeight = useLayoutStore((s) => s.headerHeight);

  return (
    <section
      className="flex w-full items-center justify-center bg-cream"
      style={{ minHeight: `calc(70vh - ${headerHeight}px)` }}
    >
      <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center md:px-10 md:py-24 animate-fade-up">
        <p className="label-lux text-gold-deep">Sacs et petite maroquinerie</p>

        <h1 className="serif mt-6 text-[2.25rem] leading-[1.08] text-ink sm:text-5xl md:text-6xl lg:text-7xl">
          Des sacs façonnés
          <br />
          <span className="italic">pour durer</span>
        </h1>

        {/* Filet doré : le seul aplat de couleur de la zone avec le bouton, il
            sépare le titre de la phrase sans ajouter de trait noir. */}
        <span aria-hidden className="mx-auto mt-8 block h-px w-16 bg-gold" />

        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-anthracite md:text-base">
          Alliez style et praticité au quotidien.
        </p>

        {/* Un lien, pas un bouton : la destination est une page, elle doit donc
            s'ouvrir dans un nouvel onglet au clic du milieu et être suivie par
            les moteurs de recherche. */}
        <Link
          to="/boutique"
          className="label-lux mt-10 inline-flex items-center gap-2 bg-gold px-8 py-4 text-ink transition-colors hover:bg-ink hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Découvrir la collection <ArrowRight />
        </Link>
      </div>
    </section>
  );
}
