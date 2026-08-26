import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "../components/Shared";
import HeroSlider from "../components/HeroSlider";
import { ArrowRight, Leaf, Truck, Shield, Rotate, Search } from "../components/icons";

const reassurance = [
  { icon: Leaf, title: "Matières sélectionnées", text: "Cuirs tannés au végétal, toiles européennes" },
  { icon: Truck, title: "Livraison & retrait", text: "À domicile ou en point relais / boutique" },
  { icon: Shield, title: "Paiement flexible", text: "À la livraison · Wave · Orange Money" },
  { icon: Rotate, title: "Retours 14 jours", text: "Échange et remboursement facilités" },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();

  return (
    <div>
      {/* Hero slider */}
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

      {/* Barre de recherche — fond noir, pleine largeur */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-6 md:py-7">
          <form
            onSubmit={(e) => { e.preventDefault(); navigate(`/boutique${query ? `?q=${encodeURIComponent(query)}` : ""}`); }}
            className="flex w-full items-center gap-3 border-b border-cream/25 pb-2 focus-within:border-gold"
          >
            <Search className="shrink-0 text-xl text-gold" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="flex-1 bg-transparent py-2 text-base outline-none placeholder:text-cream/40"
            />
            <button type="submit" className="label-lux shrink-0 text-gold transition-colors hover:text-cream">
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 md:py-20">
        <div className="mb-8 flex items-end justify-between md:mb-10">
          <div>
            <p className="label-lux text-gold-deep">Explorer</p>
            <h2 className="serif mt-2 text-[1.75rem] leading-tight sm:text-3xl md:text-4xl">Nos univers</h2>
          </div>
          <button onClick={() => navigate("/boutique")} className="label-lux hidden items-center gap-2 text-anthracite hover:text-gold-deep sm:inline-flex">
            Tout voir <ArrowRight />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2">
          {categories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => navigate(`/boutique/${encodeURIComponent(c.name)}`)}
              className={`group relative aspect-[4/5] overflow-hidden bg-cream-tint text-left ${i === 0 ? "lg:row-span-2 lg:aspect-auto" : ""}`}
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent transition-opacity duration-300 group-hover:from-ink/80" />
              <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5">
                <p className="serif text-base text-cream sm:text-lg md:text-xl">{c.name}</p>
                {c._count && <p className="label-lux mt-1 text-gold opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">{c._count.products} pièces</p>}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Bloc promo pleine largeur */}
      <section className="bg-bordeaux text-cream">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 md:px-10 py-12 md:py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="label-lux text-gold">Édition limitée</p>
            <h2 className="serif mt-4 text-3xl leading-tight sm:text-4xl md:text-5xl">La ligne Nappa,<br /><span className="italic">jusqu'à −20%</span></h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/75">
              Une sélection de nos cuirs les plus précieux, à prix atelier pendant quelques jours seulement.
            </p>
            <button
              onClick={() => navigate("/boutique")}
              className="group mt-8 inline-flex items-center gap-3 bg-gold px-8 py-4 text-ink transition-colors hover:bg-cream"
            >
              <span className="label-lux">Profiter de l'offre</span>
              <ArrowRight className="text-base transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          {products[4] && products[3] && (
            <div className="grid grid-cols-2 gap-3">
              <img src={products[4].image} alt={products[4].imageAlt} className="aspect-[4/5] w-full object-cover" />
              <img src={products[3].image} alt={products[3].imageAlt} className="mt-8 aspect-[4/5] w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* Nouveautés / grille */}
      <section className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
          <div>
            <p className="label-lux text-gold-deep">Fraîchement arrivés</p>
            <h2 className="serif mt-2 text-[1.6rem] leading-tight sm:text-3xl md:text-4xl">Nouveautés &amp; meilleures ventes</h2>
          </div>
          <button onClick={() => navigate("/boutique")} className="label-lux hidden shrink-0 items-center gap-2 text-anthracite hover:text-gold-deep sm:inline-flex">
            Toute la boutique <ArrowRight />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 12).map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* Storytelling — bento savoir-faire */}
      <section className="bg-cream-tint">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-14 md:py-20">
          <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2 lg:h-[560px]">
            {/* Bloc titre */}
            <div className="flex flex-col justify-center lg:pr-4">
              <p className="label-lux text-gold-deep">Notre savoir-faire</p>
              <h2 className="serif mt-3 text-[1.75rem] leading-[1.12] sm:text-3xl md:text-4xl">
                L'art de la maroquinerie, <span className="italic">à portée de main</span>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-anthracite">
                Chaque pièce naît de la main d'un seul artisan — du choix de la peau au dernier point sellier. Des cuirs sélectionnés, pensés pour se transmettre.
              </p>
              <button
                onClick={() => navigate("/boutique")}
                className="label-lux mt-6 inline-flex w-fit items-center gap-2 border-b border-ink pb-1 text-ink transition-colors hover:border-gold-deep hover:text-gold-deep"
              >
                Découvrir la maison <ArrowRight />
              </button>
            </div>

            {/* Carte matières */}
            <button
              onClick={() => navigate("/boutique")}
              className="group relative overflow-hidden rounded-3xl bg-ink text-left lg:row-span-2"
            >
              <img
                src="https://images.unsplash.com/photo-1683921470299-b8f0f3331657?w=800&h=1100&fit=crop&auto=format"
                alt="Main tenant un sac en cuir"
                loading="lazy"
                className="absolute inset-0 h-full min-h-[300px] w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/10" />
              <span className="label-lux absolute left-5 top-5 rounded-full bg-cream/90 px-4 py-2 text-ink">Matières</span>
              <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-gold">
                <ArrowRight className="-rotate-45 text-base" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="serif text-2xl text-cream md:text-3xl">Cuirs tannés<br />au végétal</p>
              </div>
            </button>

            {/* Grande carte — repère atelier */}
            <button
              onClick={() => navigate("/boutique")}
              className="group relative overflow-hidden rounded-3xl bg-bottle text-left lg:row-span-2"
            >
              <img
                src="https://images.unsplash.com/photo-1560891958-68bb1fe7fb78?w=900&h=1100&fit=crop&auto=format"
                alt="Femme portant un sac en cuir"
                loading="lazy"
                className="absolute inset-0 h-full min-h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute left-6 top-6">
                <p className="serif text-3xl text-cream md:text-4xl">1987</p>
                <p className="label-lux mt-1 text-cream/70">année de fondation</p>
              </div>
              <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-gold">
                <ArrowRight className="-rotate-45 text-base" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="serif text-2xl leading-tight text-cream md:text-3xl">Un savoir-faire<br />qui se transmet</p>
                <p className="mt-2 max-w-xs text-sm text-cream/75">Pièces garanties à vie sur les coutures.</p>
              </div>
            </button>

            {/* Carte fait main (bas-gauche) */}
            <button
              onClick={() => navigate("/boutique")}
              className="group relative overflow-hidden rounded-3xl bg-cream text-left"
            >
              <img
                src="https://images.unsplash.com/photo-1637759292654-a12cb2be085e?w=800&h=500&fit=crop&auto=format"
                alt="Sac en cuir fauve façonné à la main"
                loading="lazy"
                className="absolute inset-0 h-full min-h-[180px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-ink/10" />
              <span className="label-lux absolute left-5 top-5 rounded-full bg-cream/90 px-4 py-2 text-ink">Atelier</span>
              <span className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-gold">
                <ArrowRight className="-rotate-45 text-base" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="serif text-2xl text-cream md:text-3xl">Façonné à la main</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-cream-tint">
        <div className="mx-auto max-w-2xl px-6 py-14 text-center md:py-20">
          <p className="label-lux text-gold-deep">Le cercle Maïa</p>
          <h2 className="serif mt-3 text-[1.6rem] leading-tight sm:text-3xl md:text-4xl">Recevez nos histoires en avant-première</h2>
          <p className="mt-4 text-sm text-taupe">Ventes privées, nouveautés et conseils d'entretien. Sans jamais trop en faire.</p>
          <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="Votre adresse e-mail"
              className="flex-1 border border-taupe/50 bg-cream px-4 py-3.5 text-sm outline-none placeholder:text-taupe focus:border-gold"
            />
            <button className="label-lux bg-gold px-7 py-3.5 text-ink transition-colors hover:bg-gold-deep">S'inscrire</button>
          </form>
        </div>
      </section>
    </div>
  );
}
