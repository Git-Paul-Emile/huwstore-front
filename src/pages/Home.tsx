import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useTestimonials } from "../hooks/useTestimonials";
import { ProductCard } from "../components/Shared";
import TestimonialCard from "../components/TestimonialCard";
import HeroSlider from "../components/HeroSlider";
import PromoBanner from "../components/PromoBanner";
import UniverseSlider from "../components/UniverseSlider";
import { ArrowRight, Leaf, Truck, Shield, MapPin } from "../components/icons";
import { useSeo } from "../hooks/useSeo";

/**
 * Page d'accueil.
 *
 * Tout ce qui est affiché ici est soit une donnée réelle du catalogue, soit un
 * contenu saisi dans le back-office. Aucune promesse décorative : une phrase
 * affichée en vitrine engage la boutique aussi sûrement qu'un contrat, et une
 * photo d'illustration qui ne montre pas un vrai sac déçoit à la livraison.
 */

/** Réassurance. Chaque promesse correspond à une règle réellement appliquée. */
const reassurance = [
  { icon: Leaf, title: "Toile, coton et PU", text: "Des matières choisies pour l'usage quotidien" },
  { icon: MapPin, title: "Partout au Sénégal", text: "Dakar, banlieue et régions" },
  { icon: Truck, title: "Livraison rapide", text: "24 h sur Dakar, 72 h en région" },
  { icon: Shield, title: "Paiement à la livraison", text: "Vous réglez en espèces à la remise du colis" },
];

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
      "Sacs et accessoires en toile, coton et cuir polyuréthane. Livraison 24 h sur Dakar, 72 h en région, paiement à la livraison.",
  });

  return (
    <div>
      <HeroSlider />

      {/* Réassurance */}
      <section className="border-b border-taupe/25">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-8 px-5 md:px-10 py-10 lg:grid-cols-4">
          {reassurance.map((r) => (
            <div key={r.title} className="flex items-start gap-3.5">
              <r.icon className="mt-0.5 shrink-0 text-2xl text-gold-deep" />
              <div>
                <p className="text-sm font-medium text-ink">{r.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-taupe">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
        />
      )}

      {/* Nouveautés */}
      {newProducts.length > 0 && (
        <ProductSection id="nouveautes" title="Nouveautés" products={newProducts} onSeeAll={() => navigate("/boutique")} last />
      )}

      {/* Retours de clientes : contenu saisi depuis le back-office. */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 md:py-20">
          <div className="rounded-3xl bg-cream-tint px-5 py-12 sm:px-8 md:px-12 md:py-16">
            <div className="mb-10 text-center md:mb-12">
              <h2 className="serif text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">
                Les retours de nos <span className="italic text-gold-deep">clientes</span>
              </h2>
            </div>
            <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t.id} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/** Deux rangées de produits identiques : une seule mise en page à maintenir. */
function ProductSection({
  id,
  title,
  products,
  onSeeAll,
  last = false,
}: {
  id?: string;
  title: string;
  products: import("../data").Product[];
  onSeeAll: () => void;
  last?: boolean;
}) {
  return (
    <section id={id} className={`mx-auto max-w-[1400px] scroll-mt-24 px-5 md:px-10 ${last ? "pb-14 md:pb-20" : "py-14 md:py-20"}`}>
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
        <h2 className="serif text-[1.6rem] leading-tight sm:text-3xl md:text-4xl">{title}</h2>
        <button
          onClick={onSeeAll}
          className="label-lux hidden shrink-0 items-center gap-2 text-anthracite hover:text-gold-deep sm:inline-flex"
        >
          Toute la boutique <ArrowRight />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
