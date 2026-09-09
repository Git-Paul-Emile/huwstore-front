import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useTestimonials } from "../hooks/useTestimonials";
import { ProductCard } from "../components/Shared";
import TestimonialCard from "../components/TestimonialCard";
import Hero from "../components/Hero";
import PromoBanner from "../components/PromoBanner";
import UniverseSlider from "../components/UniverseSlider";
import CardRail from "../components/CardRail";
import { ArrowRight } from "../components/icons";
import { useSeo } from "../hooks/useSeo";

/**
 * Page d'accueil.
 *
 * Tout ce qui est affiché ici est soit une donnée réelle du catalogue, soit un
 * contenu saisi dans le back-office. Aucune promesse décorative : une phrase
 * affichée en vitrine engage la boutique aussi sûrement qu'un contrat, et une
 * photo d'illustration qui ne montre pas un vrai sac déçoit à la livraison.
 */

/**
 * Vitesse du glissement CONTINU, en pixels par seconde. Le rail ne s'arrête
 * pas sur chaque carte : il avance sans fin, et les produits reviennent en
 * boucle.
 *
 * 70 px/s, soit une carte toutes les trois à quatre secondes environ sur un
 * téléphone : le mouvement se remarque tout de suite, tout en laissant le
 * temps de lire un nom et un prix au passage. Le survol (ou le toucher) met
 * le rail en pause.
 *
 * Réservé aux « Meilleures ventes ». Les « Nouveautés » gardent un rail
 * immobile : deux rangées qui glissent l'une sous l'autre sur le même écran
 * se disputent le regard, et plus rien ne distingue alors la sélection que la
 * boutique met en avant du reste du catalogue.
 */
const BEST_SELLERS_SCROLL_PX_PER_SECOND = 70;

/**
 * Les témoignages, eux, avancent d'une carte toutes les sept secondes au lieu
 * de glisser sans fin : un texte de trois lignes qui se déplace pendant qu'on
 * le lit ne se lit pas. Le mouvement continu convient à des vignettes qu'on
 * regarde, pas à des phrases qu'on lit.
 */
const TESTIMONIAL_AUTOPLAY_MS = 7000;

/**
 * Largeur d'une case du rail produits. `basis-[62%]` sur mobile : la carte
 * suivante dépasse d'un tiers, ce qui annonce qu'il y a d'autres produits à
 * droite. Une case pleine largeur ne le dirait pas, et deux cases entières
 * rendraient les photos trop petites pour juger d'un sac.
 */
const PRODUCT_SLIDE = "shrink-0 basis-[62%] snap-start px-1.5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4";

/** Un témoignage à la fois sur mobile, le suivant amorcé sur le bord. */
const TESTIMONIAL_SLIDE = "shrink-0 basis-[85%] snap-start px-1.5 sm:basis-1/2 lg:basis-1/3";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // « Meilleures ventes » vient des quantités réellement commandées, calculées
  // par l'API : c'est un classement, pas une sélection faite à la main.
  const { data: bestSellers = [] } = useProducts({ sort: "best", limit: 4 });
  const { data: newProducts = [] } = useProducts({ sort: "new", limit: 8 });
  const { data: testimonials = [] } = useTestimonials();

  /**
   * Liens d'ancrage du menu (`/#meilleures-ventes`, `/#nouveautes`) : ces
   * sections n'existent dans le DOM qu'une fois leurs produits chargés, donc
   * on retente le défilement à chaque arrivée de données plutôt qu'une seule
   * fois au montage.
   */
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, bestSellers.length, newProducts.length]);

  useSeo({
    title: "HUWSTORE",
    description:
      "Sacs et accessoires en toile, coton et cuir polyuréthane. Livraison 24 h sur Dakar sauf le dimanche, 72 h en région. Paiement à la livraison sur Dakar, par Wave ou Orange Money ailleurs.",
  });

  return (
    <div>
      <Hero />

      {/* Les promesses de la boutique ne sont plus ici : depuis le 09/09/2026
          elles défilent dans le ruban du haut, au-dessus du menu, et sur la
          seule page d'accueil. Voir `components/Header.tsx`. */}

      {/* Univers : le classement par matière précède le classement par ventes,
          pour que la visiteuse choisisse d'abord une famille de sacs. */}
      <UniverseSlider />

      {/* Campagne en cours : le composant ne rend rien tant qu'aucune bannière
          « Bandeau promo » n'est publiée et dans sa fenêtre de diffusion. */}
      <PromoBanner />

      {/* Meilleures ventes : "Voir tout" ouvre la boutique triée du plus vendu
          au moins vendu, pour prolonger le classement affiché ici. */}
      {bestSellers.length > 0 && (
        <ProductSection
          id="meilleures-ventes"
          title="Meilleures ventes"
          products={bestSellers}
          onSeeAll={() => navigate("/boutique?sort=best")}
          autoScroll
        />
      )}

      {/* Nouveautés */}
      {newProducts.length > 0 && (
        <ProductSection id="nouveautes" title="Nouveautés" products={newProducts} onSeeAll={() => navigate("/boutique")} last />
      )}

      {/* Retours de clientes : contenu saisi depuis le back-office.

          La bande occupe toute la largeur au lieu d'être une carte arrondie
          posée dans la grille : elle marque une respiration entre les rangées
          de produits et le pied de page, et le demi-ton beige suffit à la
          séparer sans ajouter de bordure. */}
      {testimonials.length > 0 && (
        <section aria-labelledby="temoignages" className="bg-cream-tint py-14 md:py-20">
          <div className="mx-auto max-w-[1400px] px-5 md:px-10">
            <h2 id="temoignages" className="serif mb-8 text-center text-[1.6rem] leading-tight sm:text-3xl md:mb-10 md:text-4xl">
              Les retours de nos <span className="italic text-gold-deep">clientes</span>
            </h2>

            <CardRail
              slides={testimonials.map((t) => <TestimonialCard key={t.id} testimonial={t} />)}
              slideWidth={TESTIMONIAL_SLIDE}
              label="Les retours de nos clientes"
              autoplayMs={TESTIMONIAL_AUTOPLAY_MS}
              previousLabel="Témoignages précédents"
              nextLabel="Témoignages suivants"
            />
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Deux rangées de produits identiques : une seule mise en page à maintenir.
 *
 * Rangée défilante et non grille : sur un téléphone, une grille à deux colonnes
 * n'affiche que quatre produits par écran et cache les suivants sous un long
 * défilement vertical. Le rail en montre un et demi - la moitié visible dit
 * qu'il y en a d'autres à droite - et laisse parcourir la sélection au doigt.
 *
 * `autoScroll` fait glisser le rail en continu et en boucle - une seule
 * rangée de la page s'en sert. Le glissement s'arrête dès que la visiteuse
 * s'en approche : survol de la souris, doigt posé dessus, focus clavier. Elle
 * n'a donc jamais à courir après une carte pour la regarder ou l'ouvrir.
 */
function ProductSection({
  id,
  title,
  products,
  onSeeAll,
  last = false,
  autoScroll = false,
}: {
  id?: string;
  title: string;
  products: import("../data").Product[];
  onSeeAll: () => void;
  last?: boolean;
  /** Vrai pour la rangée qui glisse toute seule, en boucle. */
  autoScroll?: boolean;
}) {
  return (
    <section id={id} className={`mx-auto max-w-[1400px] scroll-mt-24 px-5 md:px-10 ${last ? "pb-14 md:pb-20" : "py-14 md:py-20"}`}>
      <h2 className="serif mb-8 text-center text-[1.6rem] leading-tight sm:text-3xl md:mb-10 md:text-4xl">{title}</h2>

      <CardRail
        slides={products.map((p) => <ProductCard key={p.id} p={p} />)}
        slideWidth={PRODUCT_SLIDE}
        label={title}
        continuousPxPerSecond={autoScroll ? BEST_SELLERS_SCROLL_PX_PER_SECOND : undefined}
        previousLabel="Produits précédents"
        nextLabel="Produits suivants"
      />

      {/* Le lien de sortie passe sous la rangée, centré : en haut à droite il
          entrait en concurrence avec le titre, ici il se lit comme la suite
          naturelle du parcours une fois la sélection vue. */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onSeeAll}
          className="label-lux inline-flex items-center gap-2 border-b border-ink/25 pb-1 text-anthracite transition-colors hover:border-gold-deep hover:text-gold-deep"
        >
          Toute la boutique <ArrowRight />
        </button>
      </div>
    </section>
  );
}
