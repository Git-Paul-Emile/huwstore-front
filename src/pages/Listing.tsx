import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCategories } from "../hooks/useCategories";
import { useProductFacets, useProductPage } from "../hooks/useProducts";
import { fcfa } from "../data";
import { ProductCard } from "../components/Shared";
import { ChevronDown, Close, Plus, Minus, Menu, Search as SearchIcon } from "../components/icons";
import ListingBanner from "../components/ListingBanner";
import Breadcrumb from "../components/Breadcrumb";
import { useSeo } from "../hooks/useSeo";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

type Sort = "best" | "price-asc" | "price-desc" | "new";
const SORTS: Sort[] = ["new", "best", "price-asc", "price-desc"];
const DEFAULT_SORT: Sort = "new";
const isSort = (value: string | null): value is Sort => SORTS.includes(value as Sort);

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
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: categories = [] } = useCategories();
  const { data: facets } = useProductFacets();

  const [cats, setCats] = useState<string[]>(category ? [category] : []);
  const [mats, setMats] = useState<string[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  // null = aucun plafond choisi : on affiche tout le catalogue.
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<Sort>(() => {
    const fromUrl = searchParams.get("sort");
    return isSort(fromUrl) ? fromUrl : DEFAULT_SORT;
  });
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /**
   * Recherche. Le terme vit dans l'URL (?q=), pour trois raisons : la barre de
   * l'accueil arrive ici avec sa question, un resultat de recherche se partage
   * par lien, et le bouton « retour » du navigateur retrouve la liste
   * precedente. Le champ reste local et n'interroge l'API qu'apres la frappe.
   */
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  // L'URL suit la recherche debouncee, jamais chaque touche : sinon
  // l'historique du navigateur se remplirait d'une entree par caractere.
  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (current === debouncedSearch) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("q", debouncedSearch);
    else next.delete("q");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Retour arriere ou lien externe : l'URL fait foi, le champ s'y aligne.
  useEffect(() => {
    const fromUrl = searchParams.get("q") ?? "";
    setSearch((current) => (current.trim() === fromUrl ? current : fromUrl));
  }, [searchParams]);

  /**
   * Curseur déjà actif dans le champ en arrivant depuis la loupe du menu -
   * demande du 14/09/2026. `state.focusSearch` vient de `Header` ; il est
   * effacé aussitôt lu pour qu'un rafraîchissement ou un retour arrière sur
   * cette même page ne vole pas le focus une seconde fois.
   */
  useEffect(() => {
    if (!(location.state as { focusSearch?: boolean } | null)?.focusSearch) return;
    searchInputRef.current?.focus();
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Le tri suit la même logique que la recherche : il vit dans l'URL (?sort=),
  // pour qu'un lien « Meilleures ventes » partagé depuis l'accueil ouvre la
  // boutique déjà triée.
  useEffect(() => {
    const current = searchParams.get("sort") ?? DEFAULT_SORT;
    if (current === sort) return;
    const next = new URLSearchParams(searchParams);
    if (sort !== DEFAULT_SORT) next.set("sort", sort);
    else next.delete("sort");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  useEffect(() => {
    const fromUrl = searchParams.get("sort");
    const next = isSort(fromUrl) ? fromUrl : DEFAULT_SORT;
    setSort((current) => (current === next ? current : next));
  }, [searchParams]);

  // La catégorie vient du chemin (/boutique/:category), pas de l'état local :
  // React Router ne démonte pas ce composant quand on passe d'une catégorie à
  // une autre (même route), donc sans cet effet les coches restaient bloquées
  // sur la première catégorie visitée.
  useEffect(() => {
    setCats(category ? [category] : []);
  }, [category]);

  // Bornes de prix : elles viennent des facettes, calculées en base. Sans
  // elles, le curseur mentirait dès qu'un tarif change.
  const priceBounds = { min: facets?.priceMin ?? 0, max: facets?.priceMax ?? 0 };
  const priceCap = maxPrice ?? priceBounds.max;

  /**
   * Filtrage, tri et pagination sont faits PAR LE SERVEUR.
   *
   * Le catalogue peut passer de 30 à 150 modèles (recueil de besoins, Q13) :
   * tout charger pour filtrer en mémoire fonctionnerait à la démo et
   * s'effondrerait en 3G. La requête est mise en cache par TanStack Query, donc
   * revenir à un filtre déjà vu est instantané.
   */
  const { data: pageData, isLoading, isFetching } = useProductPage({
    ...(cats.length > 0 ? { category: cats } : {}),
    ...(mats.length > 0 ? { material: mats } : {}),
    ...(cols.length > 0 ? { color: cols } : {}),
    ...(maxPrice !== null ? { maxPrice } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    sort,
    page,
    limit: 10,
  });

  const products = pageData?.items ?? [];
  const meta = pageData?.meta;

  // Tout changement de filtre ramène à la première page : rester page 3 après
  // avoir coché une matière afficherait une page vide sans explication.
  useEffect(() => {
    setPage(1);
  }, [cats, mats, cols, maxPrice, sort, debouncedSearch]);

  useSeo({
    title: debouncedSearch ? `Recherche : ${debouncedSearch}` : category ? `Boutique - ${category}` : "Boutique",
    // Une page de resultats de recherche n'a rien a faire dans un index :
    // elle produirait autant d'URL que de requetes possibles (rules/SEO.md).
    noindex: Boolean(debouncedSearch),
    description:
      "Toutes nos pièces : sacs, tote bags et accessoires. Livraison partout au Sénégal. Paiement à la livraison sur Dakar, par Wave ou Orange Money en région.",
  });

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const activeTags = [
    ...cats.map((v) => ({ v, clear: () => setCats(cats.filter((x) => x !== v)) })),
    ...mats.map((v) => ({ v, clear: () => setMats(mats.filter((x) => x !== v)) })),
    ...cols.map((v) => ({ v, clear: () => setCols(cols.filter((x) => x !== v)) })),
  ];

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
        {(facets?.materials ?? []).map((m) => check(m, mats, setMats))}
      </FilterGroup>
      <FilterGroup title="Couleur">
        <div className="flex flex-wrap gap-2">
          {(facets?.colors ?? []).map((c) => (
            <button
              key={c.slug}
              onClick={() => toggle(cols, setCols, c.name)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs tracking-wide transition-colors ${
                cols.includes(c.name) ? "bg-ink text-cream" : "border border-taupe/40 text-anthracite hover:border-gold"
              }`}
            >
              <span className="h-3 w-3 rounded-full border border-taupe/40" style={{ background: c.hex }} />
              {c.name}
            </button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Prix">
        <div className="pt-1">
          <input
            type="range"
            min={priceBounds.min}
            max={priceBounds.max}
            step={500}
            value={priceCap}
            disabled={priceBounds.max === priceBounds.min}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <div className="mt-2 flex justify-between text-xs text-taupe">
            <span>{fcfa(priceBounds.min)}</span>
            <span className="text-ink">Jusqu'à {fcfa(priceCap)}</span>
          </div>
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-5 md:px-10 py-8">
      {/* Fil d'Ariane + titre */}
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: category ?? "Boutique" }]} />

      {/* Bandeau de la boutique : trois volets qui défilent. Le `<h1>` de la
          page vit dans le premier d'entre eux, avec le nom de la catégorie
          courante. Voir `components/ListingBanner.tsx`. */}
      <ListingBanner category={category} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">{sidebar}</aside>

        <div>
          {/* Recherche */}
          <div className="mb-4 flex items-center gap-3 border border-taupe/35 px-4 focus-within:border-gold">
            <SearchIcon className="shrink-0 text-lg text-taupe" />
            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un sac, une matiere, un coloris…"
              aria-label="Rechercher dans la boutique"
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-taupe/70"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Effacer la recherche"
                className="shrink-0 text-taupe transition-colors hover:text-ink"
              >
                <Close />
              </button>
            )}
          </div>

          {/* Barre de tri */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-taupe/25 pb-4">
            <p className="text-xs text-taupe sm:text-sm" aria-live="polite">
              {isLoading ? (
                "Chargement…"
              ) : (
                <>
                  <span className="text-ink">{meta?.total ?? 0}</span>{" "}
                  {meta?.total === 1 ? "pièce" : "pièces"}
                  {meta && meta.totalPages > 1 ? ` - page ${meta.page} sur ${meta.totalPages}` : ""}
                </>
              )}
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
                <option value="new">Nouveautés</option>
                <option value="best">Meilleures ventes</option>
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
                onClick={() => { setCats([]); setMats([]); setCols([]); setMaxPrice(null); }}
                className="label-lux ml-1 text-taupe underline underline-offset-2 hover:text-bordeaux"
              >
                Tout effacer
              </button>
            </div>
          )}

          {/* Grille */}
          {products.length > 0 ? (
            <div
              className={`mt-6 grid grid-cols-2 gap-x-3 gap-y-8 transition-opacity sm:mt-8 sm:gap-x-4 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 ${
                isFetching ? "opacity-60" : ""
              }`}
            >
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            !isLoading && (
              <div className="mt-16 text-center">
                <p className="serif text-2xl text-anthracite">Aucune pièce ne correspond</p>
                <p className="mt-2 text-sm text-taupe">Ajustez vos filtres pour élargir la sélection.</p>
              </div>
            )
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-16 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrev}
                className="h-10 border border-taupe/40 px-4 text-sm text-anthracite transition-colors hover:border-gold disabled:opacity-40"
              >
                Précédent
              </button>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  aria-current={n === meta.page ? "page" : undefined}
                  className={`h-10 w-10 text-sm transition-colors ${
                    n === meta.page ? "bg-ink text-cream" : "border border-taupe/40 text-anthracite hover:border-gold"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNext}
                className="h-10 border border-taupe/40 px-4 text-sm text-anthracite transition-colors hover:border-gold disabled:opacity-40"
              >
                Suivant
              </button>
            </nav>
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
                onClick={() => { setCats([]); setMats([]); setCols([]); setMaxPrice(null); }}
                className="label-lux border border-ink py-3 text-ink transition-colors hover:bg-cream-tint"
              >
                Effacer
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="label-lux bg-ink py-3 text-cream transition-colors hover:bg-anthracite"
              >
                Voir {meta?.total ?? 0} pièces
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
