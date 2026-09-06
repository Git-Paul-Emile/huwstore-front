import { useEffect, useMemo, useState } from "react";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, ConfirmModal, useAdminAction, Req, FieldError, fcfa, th, td } from "../../components/admin/ui";
import { useCategories } from "../../hooks/useCategories";
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from "../../hooks/useProducts";
import type { Product } from "../../data";
import type { ProductInput, ProductUpdateInput } from "../../api/products";
import GalleryField from "../../components/admin/GalleryField";
import VideoField from "../../components/admin/VideoField";
import ProductOptionsManager from "../../components/admin/ProductOptionsManager";
import { useProductOptions } from "../../hooks/useProductOptions";
import { Plus, Edit, Copy, Archive, Search, Filter, Spinner, Cog } from "../../components/icons";

export default function Products() {
  // Toute écriture passe par là : un refus du serveur se voit toujours.
  const run = useAdminAction();
  const { data: products = [] } = useProducts({ all: true, limit: 100 });
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const categoryIdByName = useMemo(() => new Map(categories.map((c) => [c.name, c.id])), [categories]);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<{ key: "name" | "price"; dir: 1 | -1 }>({ key: "name", dir: 1 });
  const [sel, setSel] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [archiving, setArchiving] = useState<Product | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const statusOf = (p: Product) => (p.badge === "Rupture" ? "Rupture" : p.active === false ? "Inactif" : "Actif");

  const filtered = useMemo(() => {
    let r = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) &&
        (cat === "all" || p.category === cat) &&
        (status === "all" || statusOf(p) === status),
    );
    r = [...r].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
    });
    return r;
  }, [products, q, cat, status, sort]);

  const toggleSort = (key: "name" | "price") =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 1 ? -1 : 1 }));

  const allSel = filtered.length > 0 && filtered.every((p) => sel.includes(p.id));
  // Une action groupée en cours : on fige la barre de sélection le temps que le
  // serveur réponde, sinon un double clic relance la même opération.
  const bulkBusy = deleteProduct.isPending || updateProduct.isPending;

  const bulk = (action: "activate" | "deactivate" | "delete") => {
    for (const id of sel) {
      if (action === "delete") {
        // Chaque suppression rend compte d'elle-même : un produit déjà commandé
        // est refusé (409) avec un message qui invite à l'archiver. Pas de
        // « X produits mis à jour » global tant que le serveur n'a pas répondu.
        run(deleteProduct, id, {
          success: "Produit supprimé",
          failure: "Le produit n'a pas pu être supprimé.",
        });
      } else {
        run(updateProduct, { id, input: { active: action === "activate" } }, {
          success: action === "activate" ? "Produit activé" : "Produit désactivé",
          failure: action === "activate" ? "Le produit n'a pas pu être activé." : "Le produit n'a pas pu être désactivé.",
        });
      }
    }
    setSel([]);
  };

  const duplicate = (p: Product) => {
    const categoryId = categoryIdByName.get(p.category);
    if (!categoryId) return;
    run(
      createProduct,
      {
        name: `${p.name} (copie)`,
        collection: p.collection,
        categoryId,
        material: p.material,
        description: p.description,
        care: p.care,
        price: p.price,
        compareAt: p.compareAt,
        videoUrl: p.videoUrl,
        closure: p.specs.closure,
        capacity: p.specs.capacity,
        widthTopMm: p.specs.widthTopMm,
        widthBottomMm: p.specs.widthBottomMm,
        heightMm: p.specs.heightMm,
        depthMm: p.specs.depthMm,
        handleDropMm: p.specs.handleDropMm,
        weightGrams: p.specs.weightGrams,
        features: p.specs.features,
        includedAccessory: p.includedAccessory,
        active: false,
        // Le SKU est omis : le back en génère un nouveau, unique par produit.
        variants: p.variants.map((v) => ({
          color: v.color,
          colorSlug: v.colorSlug,
          hex: v.hex,
          hexSecondary: v.hexSecondary,
          images: v.images.map((i) => i.url),
          stockQty: 0,
          stockThreshold: v.stock.threshold,
        })),
      },
      {
        success: "Produit dupliqué (inactif, stock à zéro)",
        failure: "Le produit n'a pas pu être dupliqué.",
      },
    );
  };

  return (
    <div>
      <PageHead
        title="Produits"
        sub={`${products.length} références`}
        action={
          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => setOptionsOpen(true)}><Cog /> Matières et fermetures</Btn>
            <Btn onClick={() => setEditing("new")}><Plus /> Ajouter un produit</Btn>
          </div>
        }
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--adm-muted)" }}><Search /></span>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit…" className="pl-9" />
          </div>
          <Select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">Toutes catégories</option>
            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tous statuts</option>
            <option>Actif</option><option>Inactif</option><option>Rupture</option>
          </Select>
        </div>
      </Card>

      {sel.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3" style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)" }}>
          <span className="text-sm font-medium" style={{ color: "var(--adm-text)" }}><Filter /> {sel.length} sélectionné(s)</span>
          <Btn variant="ghost" onClick={() => bulk("activate")} disabled={bulkBusy}>Activer</Btn>
          <Btn variant="ghost" onClick={() => bulk("deactivate")} disabled={bulkBusy}>Désactiver</Btn>
          <Btn variant="danger" onClick={() => bulk("delete")} disabled={bulkBusy}>
            {deleteProduct.isPending ? <><Spinner /> Suppression…</> : "Supprimer"}
          </Btn>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSel} onChange={(e) => setSel(e.target.checked ? filtered.map((p) => p.id) : [])} />
                </th>
                <th className={th}>Produit</th>
                <th className={th}>Catégorie</th>
                <th className={`${th} cursor-pointer`} onClick={() => toggleSort("price")}>Prix ↕</th>
                <th className={th}>Stock</th>
                <th className={th}>Statut</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--adm-hover)]">
                  <td className="px-4">
                    <input type="checkbox" checked={sel.includes(p.id)} onChange={(e) => setSel((s) => e.target.checked ? [...s, p.id] : s.filter((x) => x !== p.id))} />
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.imageAlt} className="h-11 w-9 rounded-md object-cover" />
                      <div>
                        <p className="font-medium" style={{ color: "var(--adm-text)" }}>{p.name}</p>
                        <p className="text-xs" style={{ color: "var(--adm-muted)" }}>{p.collection}</p>
                      </div>
                    </div>
                  </td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{p.category}</td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>{fcfa(p.price)}</td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>
                    {p.stock?.qty ?? "-"}
                    <span className="block text-xs" style={{ color: "var(--adm-muted)" }}>
                      {p.variants.length} coloris
                    </span>
                  </td>
                  <td className={td}>
                    <Pill tone={statusOf(p) === "Actif" ? "green" : statusOf(p) === "Rupture" ? "red" : "gray"}>{statusOf(p)}</Pill>
                  </td>
                  <td className={`${td} text-right`}>
                    <div className="inline-flex gap-1" style={{ color: "var(--adm-muted)" }}>
                      <button onClick={() => setEditing(p)} className="rounded p-1.5 hover:bg-[var(--adm-hover)] hover:text-[#c9a876]" title="Éditer"><Edit /></button>
                      <button onClick={() => duplicate(p)} className="rounded p-1.5 hover:bg-[var(--adm-hover)] hover:text-[#c9a876]" title="Dupliquer"><Copy /></button>
                      <button onClick={() => setArchiving(p)} className="rounded p-1.5 hover:bg-[var(--adm-hover)] hover:text-rose-500" title="Archiver"><Archive /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="py-10 text-center text-sm" style={{ color: "var(--adm-muted)" }}>Aucun produit ne correspond.</p>}
      </Card>

      {editing && (
        /*
         * Le formulaire ne se ferme QU'APRÈS la réponse du serveur.
         *
         * Il se fermait auparavant dans la foulée de l'appel, sans attendre :
         * quand le serveur refusait la fiche, la boutique voyait le panneau se
         * fermer, aucun produit n'apparaissait, et tout ce qui venait d'être
         * saisi était perdu - sans un mot d'explication. Le refus remonte
         * maintenant DANS le formulaire, qui reste ouvert avec sa saisie.
         */
        <ProductForm
          product={editing === "new" ? null : editing}
          categories={categories}
          saving={createProduct.isPending || updateProduct.isPending}
          onClose={() => setEditing(null)}
          onCreate={(input, fail) =>
            run(createProduct, input, {
              success: "Produit créé",
              failure: "Le produit n'a pas pu être créé.",
              onSuccess: () => setEditing(null),
              onFailure: fail,
            })
          }
          onUpdate={(input, fail) => {
            if (editing === "new") return;
            run(
              updateProduct,
              { id: editing.id, input },
              {
                success: "Produit enregistré",
                failure: "Le produit n'a pas pu être enregistré.",
                onSuccess: () => setEditing(null),
                onFailure: fail,
              },
            );
          }}
        />
      )}

      {archiving && (
        <ConfirmModal
          title="Archiver le produit"
          message={`Voulez-vous archiver « ${archiving.name} » ? Il sera masqué de la boutique.`}
          confirmLabel="Archiver"
          busy={updateProduct.isPending}
          onClose={() => setArchiving(null)}
          onConfirm={() => {
            run(updateProduct, { id: archiving.id, input: { active: false } }, {
              success: "Produit archivé",
              failure: "Le produit n'a pas pu être archivé.",
              onSuccess: () => setArchiving(null),
              onFailure: () => setArchiving(null),
            });
          }}
        />
      )}

      {optionsOpen && <ProductOptionsManager onClose={() => setOptionsOpen(false)} />}
    </div>
  );
}

/** Slug d'URL : minuscules, sans accent, sans caractère spécial. */
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, "-et-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Les dimensions sont saisies en centimètres et stockées en millimètres. */
const toMm = (cmValue: string) => {
  const parsed = Number(cmValue.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 10) : undefined;
};
const toCm = (mm?: number) => (mm === undefined ? "" : String(mm / 10));

/**
 * Coloris en cours d'édition. `id` présent = coloris déjà en base (on modifie
 * son libellé, sa teinte, sa galerie ; le stock reste en lecture seule, il se
 * pilote dans l'écran Stock). `id` absent = nouveau coloris.
 */
type VariantDraft = {
  id?: string;
  color: string;
  hex: string;
  hexSecondary?: string;
  images: string[];
  stockQty: number;
  stockThreshold: number;
};

const emptyVariant = (): VariantDraft => ({ color: "", hex: "#1a1a1a", images: [], stockQty: 0, stockThreshold: 3 });

const toDrafts = (product: Product | null): VariantDraft[] =>
  product
    ? product.variants.map((v) => ({
        id: v.id,
        color: v.color,
        hex: v.hex,
        hexSecondary: v.hexSecondary,
        images: v.images.map((image) => image.url),
        stockQty: v.stock.qty,
        stockThreshold: v.stock.threshold,
      }))
    : [emptyVariant()];

const DIMENSION_FIELDS = [
  { key: "widthTopMm", label: "Largeur en haut (cm)" },
  { key: "widthBottomMm", label: "Largeur en bas (cm)" },
  { key: "heightMm", label: "Hauteur (cm)" },
  { key: "depthMm", label: "Profondeur (cm)" },
  { key: "handleDropMm", label: "Hauteur des anses (cm)" },
] as const;

type DimensionKey = (typeof DIMENSION_FIELDS)[number]["key"];

function ProductForm({
  product,
  categories,
  saving,
  onClose,
  onCreate,
  onUpdate,
}: {
  product: Product | null;
  categories: { id: string; name: string }[];
  saving: boolean;
  onClose: () => void;
  /** `fail` affiche le refus du serveur dans le formulaire, qui reste ouvert. */
  onCreate: (input: ProductInput, fail: (message: string) => void) => void;
  onUpdate: (input: ProductUpdateInput, fail: (message: string) => void) => void;
}) {
  const isEdit = product !== null;

  // Listes déroulantes gérées au back-office. Une fiche déjà enregistrée avec
  // une valeur retirée de la liste garde cette valeur : on la réinjecte en tête
  // du menu pour ne pas la perdre silencieusement à la prochaine sauvegarde.
  const { data: productOptions } = useProductOptions();
  const withCurrent = (labels: string[], current: string) =>
    current && !labels.includes(current) ? [current, ...labels] : labels;

  const [name, setName] = useState(product?.name ?? "");
  const [collection, setCollection] = useState(product?.collection ?? "HUWSTORE");
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.name === product?.category)?.id ?? categories[0]?.id ?? "",
  );

  // Les catégories arrivent d'une requête : si elles n'étaient pas encore là au
  // montage du formulaire, on cale la sélection sur la première dès qu'elles
  // arrivent, plutôt que de laisser un `<select>` qui montre une catégorie mais
  // dont la valeur est vide (« Il manque la catégorie » au clic).
  useEffect(() => {
    if (!isEdit && categoryId === "" && categories.length > 0) setCategoryId(categories[0].id);
  }, [categories, categoryId, isEdit]);
  const [material, setMaterial] = useState(product?.material ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [compareAt, setCompareAt] = useState(String(product?.compareAt ?? ""));
  const [description, setDescription] = useState(product?.description ?? "");
  const [care, setCare] = useState(product?.care ?? "");
  const [closure, setClosure] = useState(product?.specs.closure ?? "");
  const [capacity, setCapacity] = useState(product?.specs.capacity ?? "");
  const [weight, setWeight] = useState(String(product?.specs.weightGrams ?? ""));
  const [features, setFeatures] = useState((product?.specs.features ?? []).join("\n"));
  const [includedAccessory, setIncludedAccessory] = useState(product?.includedAccessory ?? "");
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl ?? "");
  const [dimensions, setDimensions] = useState<Record<DimensionKey, string>>(() =>
    Object.fromEntries(DIMENSION_FIELDS.map((f) => [f.key, toCm(product?.specs[f.key])])) as Record<DimensionKey, string>,
  );

  // Coloris éditables à la création comme à l'édition. Retirer un coloris
  // existant l'archive côté serveur (les commandes passées restent lisibles) ;
  // les quantités en stock, elles, se modifient depuis l'écran Stock.
  const [variants, setVariants] = useState<VariantDraft[]>(() => toDrafts(product));
  const [serverError, setServerError] = useState<string | null>(null);

  // Envois de photos en cours, par coloris (clé = index). Tant qu'une entrée
  // vaut `true`, une photo part encore sur Cloudinary et l'enregistrement est
  // bloqué : sinon la fiche partait sans ses images.
  const [galleryBusy, setGalleryBusy] = useState<Record<number, boolean>>({});
  const uploading = Object.values(galleryBusy).some(Boolean);

  // Les erreurs par champ n'apparaissent qu'après une première tentative
  // d'envoi : un formulaire encore vierge ne doit pas être déjà tout rouge.
  const [showErrors, setShowErrors] = useState(false);

  const setVariant = (index: number, patch: Partial<VariantDraft>) =>
    setVariants((list) => list.map((v, i) => (i === index ? { ...v, ...patch } : v)));

  /** Retire un coloris et réaligne l'état d'envoi des photos sur les nouveaux index. */
  const removeVariant = (index: number) => {
    setVariants((list) => list.filter((_, i) => i !== index));
    setGalleryBusy((busy) =>
      Object.fromEntries(
        Object.entries(busy)
          .filter(([key]) => Number(key) !== index)
          .map(([key, value]) => [Number(key) > index ? Number(key) - 1 : Number(key), value]),
      ),
    );
  };

  const priceNumber = Number(price);
  const compareNumber = Number(compareAt);

  /**
   * Une erreur par champ, rendue SOUS le champ concerné une fois `showErrors`
   * activé. Le bouton reste cliquable : c'est le clic qui révèle ce qui bloque,
   * champ par champ, plutôt qu'un bouton grisé que la boutique ne sait pas
   * déverrouiller.
   */
  const errors: Record<string, string> = {};
  if (name.trim() === "") errors.name = "Le nom est requis.";
  if (categoryId === "") errors.categoryId = "La catégorie est requise.";
  if (material.trim() === "") errors.material = "La matière est requise.";
  if (description.trim() === "") errors.description = "La description est requise.";
  if (care.trim() === "") errors.care = "Les conseils d'entretien sont requis.";
  if (!Number.isInteger(priceNumber) || priceNumber <= 0) {
    errors.price = "Un prix en chiffres entiers, sans espace ni virgule.";
  }
  if (compareAt !== "" && !(compareNumber > priceNumber)) {
    errors.compareAt = "Le prix barré doit être supérieur au prix de vente.";
  }
  if (variants.length === 0) errors.variants = "Ajoutez au moins un coloris.";
  else if (new Set(variants.map((v) => slugify(v.color))).size !== variants.length) {
    errors.variants = "Deux coloris portent le même nom : donnez-leur des noms distincts.";
  }

  // Erreurs propres à chaque coloris, alignées sur l'index du tableau. La photo
  // n'est pas un ornement : une fiche sans visuel s'affiche en boutique avec
  // une vignette vide, la contrainte est aussi posée côté serveur.
  const variantErrors = variants.map((v) => {
    const e: { color?: string; hex?: string; images?: string } = {};
    if (v.color.trim() === "") e.color = "Le nom du coloris est requis.";
    if (!/^#[0-9a-fA-F]{6}$/.test(v.hex)) e.hex = "Teinte hexadécimale attendue, ex. #1a1a1a.";
    if (v.images.length === 0) e.images = "Ajoutez au moins une photo à ce coloris.";
    return e;
  });

  const valid =
    Object.keys(errors).length === 0 && variantErrors.every((e) => Object.keys(e).length === 0);

  /** Champs communs à la création et à la mise à jour. */
  const commonFields = () => ({
    name: name.trim(),
    collection: collection.trim(),
    categoryId,
    material: material.trim(),
    description: description.trim(),
    care: care.trim(),
    price: priceNumber,
    compareAt: compareAt === "" ? undefined : compareNumber,
    closure: closure.trim() || undefined,
    capacity: capacity.trim() || undefined,
    includedAccessory: includedAccessory.trim() || undefined,
    videoUrl: videoUrl.trim() || undefined,
    weightGrams: weight === "" ? undefined : Number(weight),
    features: features
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    ...(Object.fromEntries(DIMENSION_FIELDS.map((f) => [f.key, toMm(dimensions[f.key])])) as Record<DimensionKey, number | undefined>),
  });

  const submit = () => {
    setShowErrors(true);
    if (uploading) {
      setServerError("Une photo est encore en cours d'envoi. Attendez la fin de l'envoi avant d'enregistrer.");
      return;
    }
    if (!valid) {
      setServerError(null);
      return;
    }
    setServerError(null);
    if (isEdit) {
      onUpdate({
        ...commonFields(),
        // Vidéo : chaîne vide = on retire la vidéo (null), pas « ne pas toucher ».
        videoUrl: videoUrl.trim() || null,
        variants: variants.map((v) => ({
          ...(v.id ? { id: v.id } : {}),
          color: v.color.trim(),
          colorSlug: slugify(v.color),
          hex: v.hex,
          hexSecondary: v.hexSecondary || undefined,
          images: v.images,
          stockThreshold: Number(v.stockThreshold ?? 3),
        })),
      }, setServerError);
      return;
    }
    onCreate({
      ...commonFields(),
      active: true,
      variants: variants.map((v) => ({
        color: v.color.trim(),
        colorSlug: slugify(v.color),
        hex: v.hex,
        hexSecondary: v.hexSecondary || undefined,
        images: v.images,
        stockQty: Number(v.stockQty ?? 0),
        stockThreshold: Number(v.stockThreshold ?? 3),
      })),
    }, setServerError);
  };

  const labelStyle = { color: "var(--adm-muted)" } as const;
  const sectionTitle = "mb-1.5 mt-2 text-xs font-medium uppercase tracking-wider md:col-span-2";

  return (
    <Modal title={isEdit ? "Éditer le produit" : "Nouveau produit"} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <p className="md:col-span-2 text-xs" style={labelStyle}>
          Les champs suivis d'un astérisque<Req /> sont obligatoires.
        </p>
        <p className={sectionTitle} style={labelStyle}>Informations générales</p>

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Nom<Req /></span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-required="true"
            aria-invalid={showErrors && !!errors.name}
            className="mt-1.5"
            placeholder="Tote bag en toile de coton"
          />
          <FieldError>{showErrors ? errors.name : undefined}</FieldError>
        </label>

        <label className="block text-sm">
          <span style={labelStyle}>Collection</span>
          <Input value={collection} onChange={(e) => setCollection(e.target.value)} className="mt-1.5" />
        </label>

        <label className="block text-sm">
          <span style={labelStyle}>Catégorie<Req /></span>
          <Select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-required="true"
            aria-invalid={showErrors && !!errors.categoryId}
            className="mt-1.5"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <FieldError>{showErrors ? errors.categoryId : undefined}</FieldError>
        </label>

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Matière<Req /></span>
          <Select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            aria-required="true"
            aria-invalid={showErrors && !!errors.material}
            className="mt-1.5"
          >
            <option value="" disabled>Choisir une matière…</option>
            {withCurrent(productOptions?.matiere.map((o) => o.label) ?? [], material).map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </Select>
          <span className="mt-1 block text-[0.7rem]" style={labelStyle}>
            Gérez cette liste avec « Matières et fermetures », en haut de l'écran.
          </span>
          <FieldError>{showErrors ? errors.material : undefined}</FieldError>
        </label>

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Description<Req /></span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-required="true"
            aria-invalid={showErrors && !!errors.description}
            rows={4}
            className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text)" }}
          />
          <FieldError>{showErrors ? errors.description : undefined}</FieldError>
        </label>

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Conseils d'entretien<Req /></span>
          <textarea
            value={care}
            onChange={(e) => setCare(e.target.value)}
            aria-required="true"
            aria-invalid={showErrors && !!errors.care}
            rows={3}
            className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text)" }}
          />
          <FieldError>{showErrors ? errors.care : undefined}</FieldError>
        </label>

        <p className={sectionTitle} style={labelStyle}>Prix</p>
        <label className="block text-sm">
          <span style={labelStyle}>Prix (FCFA)<Req /></span>
          {/* `text` + `inputMode` plutôt que `number` : le champ nombre avale
              les espaces et la molette, et empêche de MONTRER « 12 000 » pour
              le refuser. La validation ci-dessous s'en charge. */}
          <Input
            type="text"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            aria-required="true"
            aria-invalid={showErrors && !!errors.price}
            className="mt-1.5"
          />
          <FieldError>{showErrors ? errors.price : undefined}</FieldError>
        </label>
        <label className="block text-sm">
          <span style={labelStyle}>Prix barré (FCFA)</span>
          <Input
            type="text"
            inputMode="numeric"
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            aria-invalid={!!errors.compareAt}
            className="mt-1.5"
            placeholder="vide = aucune promotion"
          />
          <FieldError>{errors.compareAt}</FieldError>
        </label>

        <p className={sectionTitle} style={labelStyle}>Caractéristiques</p>
        <label className="block text-sm">
          <span style={labelStyle}>Fermeture</span>
          <Select value={closure} onChange={(e) => setClosure(e.target.value)} className="mt-1.5">
            <option value="">Non précisée</option>
            {withCurrent(productOptions?.fermeture.map((o) => o.label) ?? [], closure).map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </Select>
        </label>
        <label className="block text-sm">
          <span style={labelStyle}>Poids (g)</span>
          <Input type="number" min={0} value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1.5" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Capacité</span>
          <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} className="mt-1.5" placeholder="Peut contenir un ordinateur" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Accessoire inclus (facultatif)</span>
          <Input
            value={includedAccessory}
            onChange={(e) => setIncludedAccessory(e.target.value)}
            className="mt-1.5"
            placeholder="Livré avec une pochette assortie"
          />
        </label>
        <div className="md:col-span-2">
          <VideoField value={videoUrl} onChange={setVideoUrl} folder="produits" label="Vidéo du produit (facultatif)" />
        </div>

        {DIMENSION_FIELDS.map((field) => (
          <label key={field.key} className="block text-sm">
            <span style={labelStyle}>{field.label}</span>
            <Input
              type="number"
              min={0}
              step="0.1"
              value={dimensions[field.key]}
              onChange={(e) => setDimensions((d) => ({ ...d, [field.key]: e.target.value }))}
              className="mt-1.5"
            />
          </label>
        ))}

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Points forts - une ligne par élément</span>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text)" }}
            placeholder={"Fermeture zippée\nCompartiment pour ordinateur"}
          />
        </label>

        <p className={sectionTitle} style={labelStyle}>Coloris</p>

        <div className="md:col-span-2 space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id ?? `new-${index}`}
              className="space-y-4 rounded-lg border p-4"
              style={{ borderColor: "var(--adm-border)" }}
            >
              {/* En-tête du coloris : numéro + retrait */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium" style={{ color: "var(--adm-text)" }}>
                  Coloris {index + 1}
                  {!variant.id && <span style={labelStyle}> · nouveau</span>}
                </span>
                {variants.length > 1 && (
                  <Btn variant="ghost" onClick={() => removeVariant(index)}>
                    {variant.id ? "Archiver" : "Retirer"}
                  </Btn>
                )}
              </div>

              {/* Nom : pleine largeur, jamais tronqué */}
              <label className="block text-sm">
                <span style={labelStyle}>Nom du coloris<Req /></span>
                <Input
                  value={variant.color}
                  onChange={(e) => setVariant(index, { color: e.target.value })}
                  aria-required="true"
                  aria-invalid={showErrors && !!variantErrors[index]?.color}
                  className="mt-1.5"
                  placeholder="Noir & marron"
                />
                {variant.color && (
                  <span className="mt-1 block text-xs" style={labelStyle}>Adresse : /{slugify(variant.color)}</span>
                )}
                <FieldError>{showErrors ? variantErrors[index]?.color : undefined}</FieldError>
              </label>

              {/* Contrôles compacts : ils passent à la ligne au lieu de se serrer */}
              <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                <label className="block text-sm">
                  <span className="block" style={labelStyle}>Teinte<Req /></span>
                  <input
                    type="color"
                    value={variant.hex}
                    onChange={(e) => setVariant(index, { hex: e.target.value })}
                    aria-required="true"
                    className="mt-1.5 h-9 w-14 cursor-pointer rounded border"
                    style={{ borderColor: "var(--adm-border)" }}
                  />
                </label>
                <label className="block text-sm">
                  <span className="block" style={labelStyle}>2ᵉ teinte</span>
                  <input
                    type="color"
                    value={variant.hexSecondary ?? "#ffffff"}
                    onChange={(e) => setVariant(index, { hexSecondary: e.target.value })}
                    className="mt-1.5 h-9 w-14 cursor-pointer rounded border"
                    style={{ borderColor: "var(--adm-border)" }}
                  />
                </label>
                <label className="block text-sm">
                  <span className="block" style={labelStyle}>Stock</span>
                  {variant.id ? (
                    <span className="mt-1.5 flex h-9 items-center text-sm" style={{ color: "var(--adm-text)" }}>
                      {variant.stockQty}
                      <span className="ml-2 text-[0.7rem]" style={labelStyle}>modifiable dans Stock</span>
                    </span>
                  ) : (
                    <Input
                      type="number"
                      min={0}
                      value={String(variant.stockQty ?? 0)}
                      onChange={(e) => setVariant(index, { stockQty: Number(e.target.value) })}
                      className="mt-1.5 w-24"
                    />
                  )}
                </label>
                <label className="block text-sm">
                  <span className="block" style={labelStyle}>Seuil d'alerte</span>
                  <Input
                    type="number"
                    min={0}
                    value={String(variant.stockThreshold ?? 3)}
                    onChange={(e) => setVariant(index, { stockThreshold: Number(e.target.value) })}
                    className="mt-1.5 w-24"
                  />
                </label>
              </div>

              <div>
                <GalleryField
                  images={variant.images}
                  onChange={(images) => setVariant(index, { images })}
                  folder="produits"
                  label={`Photos du coloris ${variant.color || index + 1} *`}
                  onBusyChange={(busy) => setGalleryBusy((state) => ({ ...state, [index]: busy }))}
                />
                <FieldError>{showErrors ? variantErrors[index]?.images : undefined}</FieldError>
              </div>

              {variant.id && variants.length > 1 && (
                <p className="text-xs" style={labelStyle}>
                  « Archiver » masque ce coloris de la boutique ; les commandes déjà passées restent lisibles.
                </p>
              )}
            </div>
          ))}
          <Btn variant="ghost" onClick={() => setVariants((list) => [...list, emptyVariant()])}>
            <Plus /> Ajouter un coloris
          </Btn>
          <FieldError>{showErrors ? errors.variants : undefined}</FieldError>
        </div>
      </div>

      {/* Le refus du serveur s'affiche ICI, au-dessus des boutons, et le
          formulaire garde sa saisie : la boutique corrige le champ fautif au
          lieu de tout retaper. Le back renvoie un message par champ (400) ou
          « cette valeur existe déjà » (409) - il ne manquait qu'un endroit
          pour le lire. */}
      {(serverError || (showErrors && !valid)) && (
        <p
          role="alert"
          className="mt-6 rounded-lg border-l-2 border-rose-500 bg-rose-500/5 px-3 py-2.5 text-sm text-rose-600"
        >
          {serverError ?? "Des champs obligatoires sont incomplets : ils sont signalés en rouge ci-dessus."}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn onClick={submit} disabled={saving || uploading}>
          {saving
            ? "Enregistrement…"
            : uploading
              ? "Envoi des photos…"
              : isEdit
                ? "Enregistrer"
                : "Créer le produit"}
        </Btn>
      </div>
    </Modal>
  );
}
