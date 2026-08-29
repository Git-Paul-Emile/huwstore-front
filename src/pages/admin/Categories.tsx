import { useState, type FormEvent } from "react";
import { Card, PageHead, Btn, Input, Textarea, ConfirmModal, Modal, useUI, th, td } from "../../components/admin/ui";
import ImageField from "../../components/admin/ImageField";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks/useCategories";
import type { Category } from "../../data";
import { CATEGORY_DESCRIPTION_MAX } from "../../api/categories";
import { readApiError } from "../../api/axiosConfig";
import { Plus, Edit, Trash } from "../../components/icons";

/**
 * Gestion des catégories.
 *
 * Les univers de la boutique se pilotent ici : nom, visuel, résumé et ordre
 * d'affichage sur la page d'accueil. Sans cet écran, ajouter une gamme
 * imposait de passer par la base de données.
 *
 * Une catégorie qui contient des produits n'est pas supprimable : le refus
 * vient du serveur, on l'annonce ici pour éviter un aller-retour inutile.
 */
export default function Categories() {
  const { toast } = useUI();
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const removeCategory = useDeleteCategory();

  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [confirming, setConfirming] = useState<Category | null>(null);

  return (
    <div>
      <PageHead
        title="Catégories"
        sub={`${categories.length} univers - l'ordre ci-dessous est celui de la page d'accueil`}
        action={
          <Btn onClick={() => setEditing("new")}>
            <Plus /> Nouvelle catégorie
          </Btn>
        }
      />

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
            <tr>
              <th className={th}>Catégorie</th>
              <th className={th}>Produits</th>
              <th className={th}>Ordre</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t" style={{ borderColor: "var(--adm-border)" }}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <img src={category.image} alt="" className="h-12 w-10 rounded-md object-cover" />
                    <div>
                      <p style={{ color: "var(--adm-text)" }}>{category.name}</p>
                      <p className="text-xs" style={{ color: "var(--adm-muted)" }}>/{category.slug}</p>
                    </div>
                  </div>
                </td>
                <td className={td} style={{ color: "var(--adm-muted)" }}>
                  {category._count?.products ?? 0}
                </td>
                <td className={td}>
                  <Input
                    type="number"
                    min={0}
                    defaultValue={category.position}
                    className="w-24"
                    onBlur={(e) => {
                      const position = Number(e.target.value);
                      if (position === category.position) return;
                      updateCategory.mutate(
                        { id: category.id, input: { position } },
                        { onSuccess: () => toast(`Ordre de « ${category.name} » mis à jour`) },
                      );
                    }}
                  />
                </td>
                <td className={`${td} text-right`}>
                  <div className="inline-flex gap-2">
                    <Btn variant="ghost" onClick={() => setEditing(category)}>
                      <Edit /> Modifier
                    </Btn>
                    <Btn variant="ghost" onClick={() => setConfirming(category)}>
                      <Trash />
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && categories.length === 0 && (
              <tr>
                <td className={`${td} py-10 text-center`} colSpan={4} style={{ color: "var(--adm-muted)" }}>
                  Aucune catégorie. Créez-en une pour commencer à classer vos sacs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {editing && (
        <CategoryForm
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={(input, done) => {
            const request =
              editing === "new"
                ? createCategory.mutateAsync(input)
                : updateCategory.mutateAsync({ id: editing.id, input });

            request
              .then(() => {
                toast(editing === "new" ? "Catégorie créée" : "Catégorie mise à jour");
                setEditing(null);
              })
              .catch((error) => done(readApiError(error, "La catégorie n'a pas pu être enregistrée.")));
          }}
        />
      )}

      {confirming && (
        <ConfirmModal
          title="Supprimer cette catégorie ?"
          message={
            (confirming._count?.products ?? 0) > 0
              ? `« ${confirming.name} » contient ${confirming._count?.products} produit(s). Déplacez-les d'abord dans une autre catégorie.`
              : `« ${confirming.name} » sera définitivement supprimée.`
          }
          confirmLabel="Supprimer"
          onClose={() => setConfirming(null)}
          onConfirm={() =>
            removeCategory.mutate(confirming.id, {
              onSuccess: () => toast("Catégorie supprimée"),
              onError: (error) => toast(readApiError(error, "Suppression impossible."), "error"),
            })
          }
        />
      )}
    </div>
  );
}

type CategoryInput = { name: string; image: string; description: string; position: number };

function CategoryForm({
  category,
  onClose,
  onSubmit,
}: {
  category: Category | null;
  onClose: () => void;
  onSubmit: (input: CategoryInput, fail: (message: string) => void) => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [position, setPosition] = useState(category?.position ?? 0);
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!image) return setError("Choisissez une image : elle représente la catégorie sur la page d'accueil.");
    onSubmit({ name: name.trim(), image, description: description.trim(), position }, setError);
  }

  return (
    <Modal title={category ? "Modifier la catégorie" : "Nouvelle catégorie"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Nom</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className="mt-1.5" />
        </label>

        <ImageField
          value={image}
          onChange={setImage}
          folder="categories"
          label="Visuel de la catégorie"
          fit="contain"
          hint="Un sac détouré sur fond transparent (PNG ou WebP), cadré carré, au moins 800 px de côté."
        />

        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Résumé de l'univers</span>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={CATEGORY_DESCRIPTION_MAX}
            rows={2}
            className="mt-1.5"
            placeholder="Une phrase courte qui dit ce que contient cet univers."
          />
          <span className="mt-1 block text-xs" style={{ color: "var(--adm-muted)" }}>
            {description.length}/{CATEGORY_DESCRIPTION_MAX} caractères. Une phrase courte qui dit ce que contient cet
            univers. Elle est enregistrée mais n'apparaît pas encore sur le site : elle est prévue pour les pages de la
            boutique et le référencement.
          </span>
        </label>

        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Ordre d'affichage</span>
          <Input
            type="number"
            min={0}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-1.5 w-32"
          />
        </label>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn type="submit">{category ? "Enregistrer" : "Créer la catégorie"}</Btn>
        </div>
      </form>
    </Modal>
  );
}
