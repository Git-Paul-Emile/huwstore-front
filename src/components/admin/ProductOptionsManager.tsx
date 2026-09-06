import { useState } from "react";
import { Modal, Btn, Input, useAdminAction } from "./ui";
import { Plus, Trash } from "../icons";
import {
  useProductOptions,
  useCreateProductOption,
  useUpdateProductOption,
  useDeleteProductOption,
} from "../../hooks/useProductOptions";
import type { ProductOption, ProductOptionKind } from "../../api/productOptions";

/**
 * Gestion des deux listes déroulantes du formulaire produit : « Matière » et
 * « Fermeture ».
 *
 * La fiche produit garde la valeur choisie en texte, pas une référence : retirer
 * ou renommer une valeur ici ne touche jamais aux fiches déjà enregistrées.
 */
export default function ProductOptionsManager({ onClose }: { onClose: () => void }) {
  const { data } = useProductOptions();

  return (
    <Modal title="Matières et fermetures" onClose={onClose} wide>
      <p className="text-xs" style={{ color: "var(--adm-muted)" }}>
        Ces listes alimentent les menus déroulants du formulaire produit. Retirer une valeur ne modifie pas les fiches
        déjà enregistrées avec elle.
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <OptionColumn kind="matiere" title="Matières" items={data?.matiere ?? []} />
        <OptionColumn kind="fermeture" title="Fermetures" items={data?.fermeture ?? []} />
      </div>

      <div className="mt-6 flex justify-end">
        <Btn variant="ghost" onClick={onClose}>Fermer</Btn>
      </div>
    </Modal>
  );
}

function OptionColumn({
  kind,
  title,
  items,
}: {
  kind: ProductOptionKind;
  title: string;
  items: ProductOption[];
}) {
  const run = useAdminAction();
  const create = useCreateProductOption();
  const update = useUpdateProductOption();
  const remove = useDeleteProductOption();
  const [draft, setDraft] = useState("");

  const add = () => {
    const label = draft.trim();
    if (!label) return;
    run(create, { kind, label, position: items.length }, {
      success: "Valeur ajoutée",
      failure: "La valeur n'a pas pu être ajoutée.",
      onSuccess: () => setDraft(""),
    });
  };

  return (
    <div>
      <p className="text-sm font-medium" style={{ color: "var(--adm-text)" }}>{title}</p>

      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          // La cle inclut le libelle : un renommage (ici ou ailleurs) remonte le
          // champ non controle sur la nouvelle valeur.
          <li key={`${item.id}:${item.label}`} className="flex items-center gap-2">
            <Input
              defaultValue={item.label}
              className="flex-1"
              onBlur={(e) => {
                const label = e.target.value.trim();
                if (!label || label === item.label) {
                  e.target.value = item.label;
                  return;
                }
                run(update, { id: item.id, input: { label } }, {
                  success: "Valeur renommée",
                  failure: "Le nouveau nom n'a pas pu être enregistré.",
                });
              }}
            />
            <Btn
              variant="ghost"
              ariaLabel={`Retirer « ${item.label} »`}
              onClick={() =>
                run(remove, item.id, {
                  success: `« ${item.label} » retiré de la liste`,
                  failure: "La valeur n'a pas pu être retirée.",
                })
              }
            >
              <Trash />
            </Btn>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-xs" style={{ color: "var(--adm-muted)" }}>Aucune valeur pour l'instant.</li>
        )}
      </ul>

      <div className="mt-3 flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={kind === "matiere" ? "Ex. Cuir grainé" : "Ex. Zippée"}
          className="flex-1"
        />
        <Btn variant="ghost" onClick={add} disabled={create.isPending || draft.trim() === ""}>
          <Plus /> Ajouter
        </Btn>
      </div>
    </div>
  );
}
