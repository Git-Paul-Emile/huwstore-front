import { useMemo, useState } from "react";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, ConfirmModal, useUI, fcfa, th, td } from "../../components/admin/ui";
import { useCategories } from "../../hooks/useCategories";
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from "../../hooks/useProducts";
import type { Product } from "../../data";
import type { ProductInput } from "../../api/products";
import { Plus, Edit, Copy, Archive, Search, Filter } from "../../components/icons";

export default function Products() {
  const { toast } = useUI();
  const { data: products = [] } = useProducts({ all: true });
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
        name: p.name + " (copie)",
        collection: p.collection,
        categoryId,
        material: p.material,
        color: p.color,
        price: p.price,
        compareAt: p.compareAt,
        image: p.image,
        imageAlt: p.imageAlt,
        imageHover: p.imageHover,
        active: true,
      },
      { onSuccess: () => toast("Produit dupliqué") },
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
                  <td className={td} style={{ color: "var(--adm-text)" }}>{p.stock?.qty ?? "—"}</td>
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
          onSave={(input) => {
            if (editing === "new") {
              createProduct.mutate(input, { onSuccess: () => toast("Produit créé") });
            } else {
              updateProduct.mutate({ id: editing.id, input }, { onSuccess: () => toast("Produit enregistré") });
            }
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

function ProductForm({
  product, categories, onClose, onSave,
}: {
  product: Product | null;
  categories: { id: string; name: string }[];
  onClose: () => void;
  onSave: (input: ProductInput) => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(categories.find((c) => c.name === product?.category)?.id ?? categories[0]?.id ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [compareAt, setCompareAt] = useState(product?.compareAt ?? 0);
  const [material, setMaterial] = useState(product?.material ?? "");
  const [color, setColor] = useState(product?.color ?? "");

  const submit = () => {
    onSave({
      name,
      collection: "Maison Aurélie",
      categoryId,
      material,
      color,
      price: Number(price),
      compareAt: compareAt ? Number(compareAt) : undefined,
      image: product?.image ?? "",
      imageAlt: name,
      imageHover: product?.imageHover ?? "",
      active: true,
    });
  };

  return (
    <Modal title={product ? "Éditer le produit" : "Nouveau produit"} onClose={onClose} wide>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>Infos générales</p>
        </div>
        <label className="md:col-span-2 block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Nom</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" placeholder="Nom du produit" />
        </label>
        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Catégorie</span>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1.5">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </label>
        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Matière</span>
          <Input value={material} onChange={(e) => setMaterial(e.target.value)} className="mt-1.5" />
        </label>
        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Couleur</span>
          <Input value={color} onChange={(e) => setColor(e.target.value)} className="mt-1.5" />
        </label>

        <div className="md:col-span-2 mt-2">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>Prix</p>
        </div>
        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Prix (FCFA)</span>
          <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1.5" />
        </label>
        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Prix promo (FCFA)</span>
          <Input type="number" value={compareAt} onChange={(e) => setCompareAt(Number(e.target.value))} className="mt-1.5" placeholder="0 = aucun" />
        </label>

        <div className="md:col-span-2 rounded-lg border border-dashed p-6 text-center text-sm" style={{ borderColor: "var(--adm-border)", color: "var(--adm-muted)" }}>
          Glissez-déposez vos images ici · réordonnancement et image principale (démo)
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn onClick={submit} disabled={!name || !categoryId}>{product ? "Enregistrer" : "Créer le produit"}</Btn>
      </div>
    </Modal>
  );
}
