import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import { materials, colorFilters } from "../data";
import { ProductCard } from "../components/Shared";
import { ChevronDown, Close, Plus, Minus, Menu } from "../components/icons";

type Sort = "featured" | "price-asc" | "price-desc" | "new";

function FilterGroup({ title, children, open: init = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(init);
  return (
    <div className="border-b border-taupe/25 py-5">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <span className="label-lux text-ink">{title}</span>
        {open ? <Minus className="text-taupe" /> : <Plus className="text-taupe" />}
      </button>
      {open && <div className="mt-4 space-y-2.5">{children}</div>}
    </div>
  );
}

export default function Listing() {
  const navigate = useNavigate();
  const { category } = useParams<{ category?: string }>();
  const { data: categories = [] } = useCategories();
  const { data: allProducts = [] } = useProducts();

  const [cats, setCats] = useState<string[]>(category ? [category] : []);
  const [mats, setMats] = useState<string[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(800);
  const [sort, setSort] = useState<Sort>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const activeTags = [
    ...cats.map((v) => ({ v, clear: () => setCats(cats.filter((x) => x !== v)) })),
    ...mats.map((v) => ({ v, clear: () => setMats(mats.filter((x) => x !== v)) })),
    ...cols.map((v) => ({ v, clear: () => setCols(cols.filter((x) => x !== v)) })),
  ];

  const filtered = useMemo(() => {
    let r = allProducts.filter(
      (p) =>
        (cats.length === 0 || cats.includes(p.category)) &&
        (mats.length === 0 || mats.includes(p.material)) &&
        (cols.length === 0 || cols.includes(p.color)) &&
        p.price <= maxPrice,
    );
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "new") r = [...r].sort((a, b) => (b.badge === "Nouveau" ? 1 : 0) - (a.badge === "Nouveau" ? 1 : 0));
    return r;
  }, [allProducts, cats, mats, cols, maxPrice, sort]);

  const check = (label: string, arr: string[], set: (v: string[]) => void, count?: number) => (
    <label key={label} className="flex cursor-pointer items-center gap-2.5 text-sm text-anthracite">
      <input
        type="checkbox"
        checked={arr.includes(label)}
        onChange={() => toggle(arr, set, label)}
        className="h-3.5 w-3.5 shrink-0 appearance-none border border-taupe/60 checked:border-gold checked:bg-gold"
      />
      <span className="flex-1 group-hover:text-ink">{label}</span>
      {count != null && <span className="text-xs text-taupe">({count})</span>}
    </label>
  );

  const sidebar = (
    <div>
      <FilterGroup title="Catégories">
        {categories.map((c) => check(c.name, cats, setCats, c._count?.products))}
      </FilterGroup>
      <FilterGroup title="Matière">
        {materials.map((m) => check(m, mats, setMats))}
      </FilterGroup>
      <FilterGroup title="Couleur">
        <div className="flex flex-wrap gap-2">
          {colorFilters.map((c) => (
            <button
              key={c}
              onClick={() => toggle(cols, setCols, c)}
              className={`px-3 py-1.5 text-xs tracking-wide transition-colors ${
                cols.includes(c) ? "bg-ink text-cream" : "border border-taupe/40 text-anthracite hover:border-gold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Prix">
        <div className="pt-1">
          <input
            type="range"
            min={200}
            max={800}
            step={10}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="mt-2 flex justify-between text-xs text-taupe">
            <span>200 €</span>
            <span className="text-ink">Jusqu'à {maxPrice} €</span>
          </div>
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-8">
      {/* Fil d'Ariane + titre */}
      <nav className="label-lux flex items-center gap-2 text-taupe">
        <button onClick={() => navigate("/")} className="hover:text-gold-deep">Accueil</button>
        <span>/</span>
        <span className="text-anthracite">{category ?? "Boutique"}</span>
      </nav>

      {/* Bandeau catégorie */}
      <div className="mt-6 flex flex-col items-center justify-center bg-cream-tint px-6 py-10 text-center md:py-14">
        <p className="label-lux text-gold-deep">Maroquinerie</p>
        <h1 className="serif mt-3 text-[2rem] leading-tight sm:text-4xl md:text-5xl">{category ?? "Toute la collection"}</h1>
        <p className="mt-3 max-w-lg text-sm text-taupe">
          Des pièces façonnées à la main, sélectionnées pour leur matière et leur ligne.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">{sidebar}</aside>

        <div>
          {/* Barre de tri */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-taupe/25 pb-4">
            <p className="text-xs text-taupe sm:text-sm">
              <span className="text-ink">{filtered.length}</span> sur {allProducts.length} résultats
            </p>
            <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(true)}
              className="label-lux inline-flex items-center gap-2 border border-taupe/40 px-4 py-2.5 text-ink transition-colors hover:border-gold lg:hidden"
            >
              <Menu className="text-base" /> Filtres
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="label-lux appearance-none border border-taupe/40 bg-transparent py-2.5 pl-4 pr-9 text-ink outline-none focus:border-gold"
              >
                <option value="featured">Mise en avant</option>
                <option value="new">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-taupe" />
            </div>
            </div>
          </div>

          {/* Tags actifs */}
          {activeTags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeTags.map((t) => (
                <button key={t.v} onClick={t.clear} className="flex items-center gap-1.5 bg-cream-tint px-3 py-1.5 text-xs text-anthracite transition-colors hover:text-bordeaux">
                  {t.v} <Close className="text-sm" />
                </button>
              ))}
              <button
                onClick={() => { setCats([]); setMats([]); setCols([]); setMaxPrice(800); }}
                className="label-lux ml-1 text-taupe underline underline-offset-2 hover:text-bordeaux"
              >
                Tout effacer
              </button>
            </div>
          )}

          {/* Grille */}
          {filtered.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="mt-16 text-center">
              <p className="serif text-2xl text-anthracite">Aucune pièce ne correspond</p>
              <p className="mt-2 text-sm text-taupe">Ajustez vos filtres pour élargir la sélection.</p>
            </div>
          )}

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              {["1", "2", "3"].map((n, i) => (
                <button
                  key={n}
                  className={`h-10 w-10 text-sm transition-colors ${i === 0 ? "bg-ink text-cream" : "border border-taupe/40 text-anthracite hover:border-gold"}`}
                >
                  {n}
                </button>
              ))}
              <button className="h-10 border border-taupe/40 px-4 text-sm text-anthracite transition-colors hover:border-gold">Suivant</button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer filtres mobile */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFiltersOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-cream animate-slide-in">
            <div className="flex items-center justify-between border-b border-taupe/25 px-6 py-5">
              <h2 className="serif text-xl">Filtres</h2>
              <button onClick={() => setFiltersOpen(false)} className="text-2xl transition-colors hover:text-gold-deep"><Close /></button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-6">{sidebar}</div>
            <div className="grid grid-cols-2 gap-3 border-t border-taupe/25 px-6 py-4">
              <button
                onClick={() => { setCats([]); setMats([]); setCols([]); setMaxPrice(800); }}
                className="label-lux border border-ink py-3 text-ink transition-colors hover:bg-cream-tint"
              >
                Effacer
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="label-lux bg-ink py-3 text-cream transition-colors hover:bg-anthracite"
              >
                Voir {filtered.length} pièces
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
