import { useMemo, useState } from "react";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, ConfirmModal, useUI, fcfa, th, td } from "../../components/admin/ui";
import { useCategories } from "../../hooks/useCategories";
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from "../../hooks/useProducts";
import type { Product } from "../../data";
import type { ProductInput, ProductUpdateInput, VariantInput } from "../../api/products";
import GalleryField from "../../components/admin/GalleryField";
import { Plus, Edit, Copy, Archive, Search, Filter } from "../../components/icons";

export default function Products() {
  const { toast } = useUI();
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

  const bulk = (action: "activate" | "deactivate" | "delete") => {
    for (const id of sel) {
      if (action === "delete") deleteProduct.mutate(id);
      else updateProduct.mutate({ id, input: { active: action === "activate" } });
    }
    toast(`${sel.length} produit(s) mis à jour`);
    setSel([]);
  };

  const duplicate = (p: Product) => {
    const categoryId = categoryIdByName.get(p.category);
    if (!categoryId) return;
    createProduct.mutate(
      {
        name: `${p.name} (copie)`,
        collection: p.collection,
        categoryId,
        material: p.material,
        description: p.description,
        care: p.care,
        price: p.price,
        compareAt: p.compareAt,
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
      { onSuccess: () => toast("Produit dupliqué (inactif, stock à zéro)") },
    );
  };

  return (
    <div>
      <PageHead
        title="Produits"
        sub={`${products.length} références`}
        action={<Btn onClick={() => setEditing("new")}><Plus /> Ajouter un produit</Btn>}
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
          <Btn variant="ghost" onClick={() => bulk("activate")}>Activer</Btn>
          <Btn variant="ghost" onClick={() => bulk("deactivate")}>Désactiver</Btn>
          <Btn variant="danger" onClick={() => bulk("delete")}>Supprimer</Btn>
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
        <ProductForm
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onCreate={(input) => {
            createProduct.mutate(input, { onSuccess: () => toast("Produit créé") });
            setEditing(null);
          }}
          onUpdate={(input) => {
            if (editing === "new") return;
            updateProduct.mutate({ id: editing.id, input }, { onSuccess: () => toast("Produit enregistré") });
            setEditing(null);
          }}
        />
      )}

      {archiving && (
        <ConfirmModal
          title="Archiver le produit"
          message={`Voulez-vous archiver « ${archiving.name} » ? Il sera masqué de la boutique.`}
          confirmLabel="Archiver"
          onClose={() => setArchiving(null)}
          onConfirm={() => {
            updateProduct.mutate({ id: archiving.id, input: { active: false } });
            toast("Produit archivé");
          }}
        />
      )}
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

const emptyVariant = (): VariantInput => ({ color: "", colorSlug: "", hex: "#1a1a1a", images: [], stockQty: 0, stockThreshold: 3 });

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
  onClose,
  onCreate,
  onUpdate,
}: {
  product: Product | null;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onCreate: (input: ProductInput) => void;
  onUpdate: (input: ProductUpdateInput) => void;
}) {
  const isEdit = product !== null;

  const [name, setName] = useState(product?.name ?? "");
  const [collection, setCollection] = useState(product?.collection ?? "HUWSTORE");
  const [categoryId, setCategoryId] = useState(
    categories.find((c) => c.name === product?.category)?.id ?? categories[0]?.id ?? "",
  );
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
  const [dimensions, setDimensions] = useState<Record<DimensionKey, string>>(() =>
    Object.fromEntries(DIMENSION_FIELDS.map((f) => [f.key, toCm(product?.specs[f.key])])) as Record<DimensionKey, string>,
  );

  // Les déclinaisons ne se saisissent qu'à la création : les modifier ensuite
  // toucherait au stock et aux commandes, ce qui passe par l'écran Stock.
  const [variants, setVariants] = useState<VariantInput[]>([emptyVariant()]);

  const setVariant = (index: number, patch: Partial<VariantInput>) =>
    setVariants((list) => list.map((v, i) => (i === index ? { ...v, ...patch } : v)));

  const priceNumber = Number(price);
  const compareNumber = Number(compareAt);

  const variantsValid =
    isEdit ||
    (variants.length > 0 &&
      variants.every((v) => v.color.trim() !== "" && /^#[0-9a-fA-F]{6}$/.test(v.hex)) &&
      new Set(variants.map((v) => slugify(v.color))).size === variants.length);

  const valid =
    name.trim() !== "" &&
    categoryId !== "" &&
    material.trim() !== "" &&
    description.trim() !== "" &&
    care.trim() !== "" &&
    Number.isInteger(priceNumber) &&
    priceNumber > 0 &&
    (compareAt === "" || compareNumber > priceNumber) &&
    variantsValid;

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
    weightGrams: weight === "" ? undefined : Number(weight),
    features: features
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    ...(Object.fromEntries(DIMENSION_FIELDS.map((f) => [f.key, toMm(dimensions[f.key])])) as Record<DimensionKey, number | undefined>),
  });

  const submit = () => {
    if (!valid) return;
    if (isEdit) {
      onUpdate(commonFields());
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
    });
  };

  const labelStyle = { color: "var(--adm-muted)" } as const;
  const sectionTitle = "mb-1.5 mt-2 text-xs font-medium uppercase tracking-wider md:col-span-2";

  return (
    <Modal title={isEdit ? "Éditer le produit" : "Nouveau produit"} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <p className={sectionTitle} style={labelStyle}>Informations générales</p>

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Nom</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Tote bag en toile de coton" />
        </label>

        <label className="block text-sm">
          <span style={labelStyle}>Collection</span>
          <Input value={collection} onChange={(e) => setCollection(e.target.value)} className="mt-1.5" />
        </label>

        <label className="block text-sm">
          <span style={labelStyle}>Catégorie</span>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1.5">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </label>

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Matière</span>
          <Input value={material} onChange={(e) => setMaterial(e.target.value)} className="mt-1.5" placeholder="Toile de coton" />
        </label>

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text)" }}
          />
        </label>

        <label className="block text-sm md:col-span-2">
          <span style={labelStyle}>Conseils d'entretien</span>
          <textarea
            value={care}
            onChange={(e) => setCare(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            style={{ borderColor: "var(--adm-border)", background: "var(--adm-surface)", color: "var(--adm-text)" }}
          />
        </label>

        <p className={sectionTitle} style={labelStyle}>Prix</p>
        <label className="block text-sm">
          <span style={labelStyle}>Prix (FCFA)</span>
          <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1.5" />
        </label>
        <label className="block text-sm">
          <span style={labelStyle}>Prix barré (FCFA)</span>
          <Input
            type="number"
            min={0}
            value={compareAt}
            onChange={(e) => setCompareAt(e.target.value)}
            className="mt-1.5"
            placeholder="vide = aucune promotion"
          />
        </label>
        {compareAt !== "" && compareNumber <= priceNumber && (
          <p className="text-xs text-rose-500 md:col-span-2">Le prix barré doit être supérieur au prix de vente.</p>
        )}

        <p className={sectionTitle} style={labelStyle}>Caractéristiques</p>
        <label className="block text-sm">
          <span style={labelStyle}>Fermeture</span>
          <Input value={closure} onChange={(e) => setClosure(e.target.value)} className="mt-1.5" placeholder="Zippée" />
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

        {product ? (
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <span
                  key={v.id}
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
                  style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border"
                    style={{
                      borderColor: "var(--adm-border)",
                      background: v.hexSecondary ? `linear-gradient(135deg, ${v.hex} 50%, ${v.hexSecondary} 50%)` : v.hex,
                    }}
                  />
                  {v.color} - {v.stock.qty} en stock
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs" style={labelStyle}>
              Les quantités se modifient depuis l'écran Stock, pour que chaque changement laisse un mouvement traçable.
            </p>
          </div>
        ) : (
          <div className="md:col-span-2 space-y-3">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border p-3 md:grid-cols-[1fr_auto_auto_auto_auto]"
                style={{ borderColor: "var(--adm-border)" }}
              >
                <label className="block text-sm">
                  <span style={labelStyle}>Nom du coloris</span>
                  <Input
                    value={variant.color}
                    onChange={(e) => setVariant(index, { color: e.target.value })}
                    className="mt-1.5"
                    placeholder="Noir"
                  />
                  {variant.color && (
                    <span className="mt-1 block text-xs" style={labelStyle}>slug : {slugify(variant.color)}</span>
                  )}
                </label>
                <label className="block text-sm">
                  <span style={labelStyle}>Teinte</span>
                  <input
                    type="color"
                    value={variant.hex}
                    onChange={(e) => setVariant(index, { hex: e.target.value })}
                    className="mt-1.5 h-9 w-14 cursor-pointer rounded border"
                    style={{ borderColor: "var(--adm-border)" }}
                  />
                </label>
                <label className="block text-sm">
                  <span style={labelStyle}>2ᵉ teinte</span>
                  <input
                    type="color"
                    value={variant.hexSecondary ?? "#ffffff"}
                    onChange={(e) => setVariant(index, { hexSecondary: e.target.value })}
                    className="mt-1.5 h-9 w-14 cursor-pointer rounded border"
                    style={{ borderColor: "var(--adm-border)" }}
                  />
                </label>
                <label className="block text-sm">
                  <span style={labelStyle}>Stock</span>
                  <Input
                    type="number"
                    min={0}
                    value={String(variant.stockQty ?? 0)}
                    onChange={(e) => setVariant(index, { stockQty: Number(e.target.value) })}
                    className="mt-1.5 w-24"
                  />
                </label>
                <label className="block text-sm">
                  <span style={labelStyle}>Seuil</span>
                  <Input
                    type="number"
                    min={0}
                    value={String(variant.stockThreshold ?? 3)}
                    onChange={(e) => setVariant(index, { stockThreshold: Number(e.target.value) })}
                    className="mt-1.5 w-24"
                  />
                </label>
                <div className="md:col-span-5">
                  <GalleryField
                    images={variant.images}
                    onChange={(images) => setVariant(index, { images })}
                    folder="produits"
                    label={`Photos du coloris ${variant.color || index + 1}`}
                  />
                </div>
                {variants.length > 1 && (
                  <div className="md:col-span-5">
                    <Btn variant="ghost" onClick={() => setVariants((list) => list.filter((_, i) => i !== index))}>
                      Retirer ce coloris
                    </Btn>
                  </div>
                )}
              </div>
            ))}
            <Btn variant="ghost" onClick={() => setVariants((list) => [...list, emptyVariant()])}>
              <Plus /> Ajouter un coloris
            </Btn>
            {!variantsValid && (
              <p className="text-xs text-rose-500">
                Chaque coloris doit avoir un nom unique et une teinte valide.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn onClick={submit} disabled={!valid}>{isEdit ? "Enregistrer" : "Créer le produit"}</Btn>
      </div>
    </Modal>
  );
}
