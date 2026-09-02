import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, ConfirmModal, useUI } from "../../components/admin/ui";
import ImageField from "../../components/admin/ImageField";
import type { Product } from "../../data";
import {
  useAllBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "../../hooks/useBanners";
import type { Banner, BannerInput, BannerLinkType } from "../../api/banners";
import { BANNER_LINK_TYPES } from "../../api/banners";
import { useCategories } from "../../hooks/useCategories";
import { useProducts } from "../../hooks/useProducts";
import { readApiError } from "../../api/axiosConfig";
import { Plus, Edit, Trash, Search, ChevronDown, Check } from "../../components/icons";

/**
 * Campagnes.
 *
 * Une campagne alimente le bandeau posé au milieu de la page d'accueil : un
 * bloc noir avec une photo, un titre, un texte et un bouton, diffusé entre
 * deux dates. Rien n'est écrit en dur dans le code du site - annoncer une
 * promotion ne demande donc aucune mise en ligne.
 *
 * Il n'y a plus qu'un seul emplacement, d'où l'absence de choix dans le
 * formulaire. Le haut de la page d'accueil n'est plus une bannière depuis la
 * refonte (bloc fixe écrit dans le code), et la pop-up a été retirée : elle ne
 * s'affichait nulle part.
 *
 * La vitrine n'affiche QU'UNE campagne à la fois, celle qui vient en premier :
 * le serveur refuse donc d'en programmer deux sur la même période plutôt que
 * d'en cacher une sans le dire.
 */
const EMPLACEMENT: Banner["slot"] = "Bandeau promo";

const isLive = (banner: Banner) => {
  const now = Date.now();
  return banner.active && new Date(banner.start).getTime() <= now && new Date(banner.end).getTime() >= now;
};

export default function Banners() {
  const { toast } = useUI();
  const { data: banners = [], isLoading } = useAllBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const removeBanner = useDeleteBanner();

  const [editing, setEditing] = useState<Banner | "new" | null>(null);
  const [confirming, setConfirming] = useState<Banner | null>(null);

  return (
    <div>
      <PageHead
        title="Campagnes"
        sub="Le bandeau promotionnel de la page d'accueil"
        action={
          <Btn onClick={() => setEditing("new")}>
            <Plus /> Nouvelle campagne
          </Btn>
        }
      />

      <div className="space-y-3">
        {banners.map((banner) => (
          <Card key={banner.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <img src={banner.image} alt={banner.title} className="h-24 w-full rounded-lg object-cover sm:w-40" />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>
                  {banner.title}
                </h3>
                <Pill tone="blue">{banner.target}</Pill>
                <Pill tone={isLive(banner) ? "green" : "gray"}>{isLive(banner) ? "En ligne" : "Hors ligne"}</Pill>
              </div>
              {banner.subtitle && (
                <p className="mt-1 text-sm italic" style={{ color: "var(--adm-muted)" }}>{banner.subtitle}</p>
              )}
              <p className="mt-1 text-xs" style={{ color: "var(--adm-muted)" }}>
                Position {banner.position} - du {new Date(banner.start).toLocaleDateString("fr-FR")} au{" "}
                {new Date(banner.end).toLocaleDateString("fr-FR")}
              </p>
              {banner.ctaLabel && (
                <p className="mt-1 text-xs" style={{ color: "var(--adm-muted)" }}>
                  Bouton « {banner.ctaLabel} » - {banner.linkType.toLowerCase()}
                  {banner.ctaHref ? ` vers ${banner.ctaHref}` : ""}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateBanner.mutate(
                    { id: banner.id, input: { active: !banner.active } },
                    { onSuccess: () => toast(banner.active ? "Campagne désactivée" : "Campagne activée") },
                  )
                }
                aria-label={banner.active ? "Désactiver la campagne" : "Activer la campagne"}
                className={`relative h-6 w-11 rounded-full transition-colors ${banner.active ? "bg-emerald-500" : ""}`}
                style={banner.active ? undefined : { background: "var(--adm-border)" }}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${banner.active ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
              <Btn variant="ghost" onClick={() => setEditing(banner)}>
                <Edit /> Éditer
              </Btn>
              <Btn variant="ghost" onClick={() => setConfirming(banner)}>
                <Trash />
              </Btn>
            </div>
          </Card>
        ))}

        {!isLoading && banners.length === 0 && (
          <Card className="p-10 text-center text-sm">
            <span style={{ color: "var(--adm-muted)" }}>
              Aucune campagne en cours. La page d'accueil enchaîne alors ses univers et ses produits, sans bandeau.
            </span>
          </Card>
        )}
      </div>

      {editing && (
        <BannerForm
          banner={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={(input, fail) => {
            const request =
              editing === "new"
                ? createBanner.mutateAsync(input)
                : updateBanner.mutateAsync({ id: editing.id, input });

            request
              .then(() => {
                toast(editing === "new" ? "Campagne créée" : "Campagne mise à jour");
                setEditing(null);
              })
              .catch((error) => fail(readApiError(error, "La campagne n'a pas pu être enregistrée.")));
          }}
        />
      )}

      {confirming && (
        <ConfirmModal
          title="Supprimer cette campagne ?"
          message={`« ${confirming.title} » sera définitivement supprimée.`}
          confirmLabel="Supprimer"
          onClose={() => setConfirming(null)}
          onConfirm={() =>
            removeBanner.mutate(confirming.id, {
              onSuccess: () => toast("Campagne supprimée"),
              onError: (error) => toast(readApiError(error, "Suppression impossible."), "error"),
            })
          }
        />
      )}
    </div>
  );
}

/** Date du jour au format attendu par <input type="date">. */
const isoDay = (value?: string) => (value ? new Date(value) : new Date()).toISOString().slice(0, 10);
const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

function BannerForm({
  banner,
  onClose,
  onSubmit,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSubmit: (input: BannerInput, fail: (message: string) => void) => void;
}) {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts({ all: true, limit: 100 });

  const [form, setForm] = useState({
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    text: banner?.text ?? "",
    ctaLabel: banner?.ctaLabel ?? "J'en profite",
    linkType: banner?.linkType ?? ("Page libre" as BannerLinkType),
    // Pour « Page libre » on garde le dernier chemin choisi ; sinon /boutique.
    ctaHref: (banner?.linkType ?? "Page libre") === "Page libre" ? banner?.ctaHref ?? "/boutique" : "/boutique",
    linkCategoryId: banner?.linkCategoryId ?? "",
    linkProductId: banner?.linkProductId ?? "",
    slot: EMPLACEMENT,
    target: banner?.target ?? ("Toutes" as Banner["target"]),
    position: banner?.position ?? 0,
    start: isoDay(banner?.start),
    end: banner ? isoDay(banner.end) : inDays(365),
    active: banner?.active ?? true,
    image: banner?.image ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!form.image) return setError("Choisissez une image : c'est elle qu'on verra en premier.");
    if (new Date(form.end) <= new Date(form.start)) {
      return setError("La date de fin doit être postérieure à la date de début.");
    }
    if (form.linkType === "Catégorie" && !form.linkCategoryId) {
      return setError("Choisissez la catégorie vers laquelle mène le bouton.");
    }
    if (form.linkType === "Produit" && !form.linkProductId) {
      return setError("Choisissez le produit vers lequel mène le bouton.");
    }
    if (form.linkType === "Page libre" && !form.ctaHref.trim()) {
      return setError("Indiquez la page vers laquelle mène le bouton, ex. /boutique.");
    }

    // Une seule piste de destination part au serveur ; les autres à null.
    const link: Pick<BannerInput, "linkType" | "ctaHref" | "linkCategoryId" | "linkProductId"> = {
      linkType: form.linkType,
      ctaHref: form.linkType === "Page libre" ? form.ctaHref.trim() : null,
      linkCategoryId: form.linkType === "Catégorie" ? form.linkCategoryId : null,
      linkProductId: form.linkType === "Produit" ? form.linkProductId : null,
    };

    onSubmit(
      {
        ...form,
        ...link,
        subtitle: form.subtitle.trim(),
        text: form.text.trim(),
        ctaLabel: form.ctaLabel.trim(),
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
      },
      setError,
    );
  }

  return (
    <Modal title={banner ? "Modifier la campagne" : "Nouvelle campagne"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <ImageField
          value={form.image}
          onChange={(url) => set("image", url)}
          folder="bannieres"
          label="Visuel"
          hint="Format paysage conseillé, au moins 1600 px de large."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Titre</span>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={80} className="mt-1.5" />
          </label>
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Deuxième ligne (en italique)</span>
            <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} maxLength={80} className="mt-1.5" />
          </label>
        </div>

        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Texte</span>
          <Input value={form.text} onChange={(e) => set("text", e.target.value)} maxLength={240} className="mt-1.5" />
        </label>

        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Libellé du bouton</span>
          <Input
            value={form.ctaLabel}
            onChange={(e) => set("ctaLabel", e.target.value)}
            placeholder="Découvrir la collection"
            maxLength={40}
            className="mt-1.5"
          />
        </label>

        {/* Destination : la campagne mène vers une catégorie, un produit, ou
            une page libre saisie à la main. Le serveur en déduit l'URL finale
            du bouton. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Le bouton mène vers</span>
            <Select
              value={form.linkType}
              onChange={(e) => set("linkType", e.target.value as BannerLinkType)}
              className="mt-1.5"
            >
              {BANNER_LINK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "Page libre" ? "Une page (lien libre)" : t === "Catégorie" ? "Une catégorie" : "Un produit"}
                </option>
              ))}
            </Select>
          </label>

          {form.linkType === "Page libre" && (
            <label className="block text-sm">
              <span style={{ color: "var(--adm-muted)" }}>Chemin de la page</span>
              <Input value={form.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} placeholder="/boutique" className="mt-1.5" />
            </label>
          )}

          {form.linkType === "Catégorie" && (
            <label className="block text-sm">
              <span style={{ color: "var(--adm-muted)" }}>Catégorie</span>
              <Select value={form.linkCategoryId} onChange={(e) => set("linkCategoryId", e.target.value)} className="mt-1.5">
                <option value="">Choisir une catégorie…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </label>
          )}

          {form.linkType === "Produit" && (
            <div className="block text-sm">
              <span style={{ color: "var(--adm-muted)" }}>Produit</span>
              <ProductPicker
                products={products}
                value={form.linkProductId}
                onChange={(id) => set("linkProductId", id)}
              />
            </div>
          )}
        </div>

        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Ordre d'affichage</span>
          <Input type="number" min={0} value={form.position} onChange={(e) => set("position", Number(e.target.value))} className="mt-1.5" />
          <span className="mt-1 block text-xs" style={{ color: "var(--adm-muted)" }}>
            Quand plusieurs campagnes tournent, la plus petite valeur passe en premier.
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Début de diffusion</span>
            <Input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} required className="mt-1.5" />
          </label>
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Fin de diffusion</span>
            <Input type="date" value={form.end} onChange={(e) => set("end", e.target.value)} required className="mt-1.5" />
          </label>
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Affichage</span>
            <Select value={form.target} onChange={(e) => set("target", e.target.value as Banner["target"])} className="mt-1.5">
              <option value="Toutes">Tous les écrans</option>
              <option value="Mobile">Mobile seulement</option>
              <option value="Desktop">Ordinateur seulement</option>
            </Select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--adm-text)" }}>
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4" />
          Campagne active
        </label>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn type="submit">{banner ? "Enregistrer" : "Créer la campagne"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

/**
 * Sélecteur de produit avec vignette. Un <select> natif ne sait pas afficher
 * d'image : on ouvre donc une liste déroulante maison, avec recherche et
 * miniature à gauche du nom.
 */
function ProductPicker({
  products,
  value,
  onChange,
}: {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const selected = products.find((p) => p.id === value) ?? null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      : products;
    return list.slice(0, 50);
  }, [products, query]);

  // Fermeture au clic hors du composant et à la touche Échap.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={boxRef} className="relative mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm outline-none transition-colors focus:border-gold"
        style={{ background: "var(--adm-surface-2)", borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
      >
        {selected ? (
          <>
            <img src={selected.image} alt="" className="h-8 w-8 shrink-0 rounded object-cover object-center" />
            <span className="truncate">{selected.name}</span>
          </>
        ) : (
          <span style={{ color: "var(--adm-muted)" }}>Choisir un produit…</span>
        )}
        <ChevronDown className="ml-auto shrink-0" />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
          style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
        >
          <div
            className="flex items-center gap-2 border-b px-3 py-2"
            style={{ borderColor: "var(--adm-border)", color: "var(--adm-muted)" }}
          >
            <Search />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--adm-text)" }}
            />
          </div>
          <ul className="max-h-56 overflow-y-auto py-1">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => pick(p.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[var(--adm-hover)]"
                  style={{ color: "var(--adm-text)" }}
                >
                  <img src={p.image} alt="" className="h-9 w-9 shrink-0 rounded object-cover object-center" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{p.name}</span>
                    <span className="block truncate text-xs" style={{ color: "var(--adm-muted)" }}>
                      {p.category}
                      {p.active === false ? " - masqué" : ""}
                    </span>
                  </span>
                  {p.id === value && <Check className="shrink-0 text-gold" />}
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-3 py-4 text-center text-sm" style={{ color: "var(--adm-muted)" }}>
                Aucun produit trouvé.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
