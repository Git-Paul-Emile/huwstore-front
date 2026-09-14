import { useState } from "react";
import { Card, PageHead, Btn, Input, Modal, ConfirmModal, useAdminAction } from "../../components/admin/ui";
import {
  useTestimonials,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
} from "../../hooks/useTestimonials";
import type { Testimonial, TestimonialInput } from "../../api/testimonials";
import { Plus, Edit, Trash } from "../../components/icons";

export default function Testimonials() {
  const run = useAdminAction();
  const { data: rows = [] } = useTestimonials();
  const createTestimonial = useCreateTestimonial();
  const updateTestimonial = useUpdateTestimonial();
  const deleteTestimonial = useDeleteTestimonial();

  const [editing, setEditing] = useState<Testimonial | "new" | null>(null);
  const [removing, setRemoving] = useState<Testimonial | null>(null);

  const toggle = (t: Testimonial) =>
    run(updateTestimonial, { id: t.id, input: { active: !t.active } }, {
      success: t.active ? "Témoignage masqué" : "Témoignage affiché",
      failure: "Le témoignage n'a pas pu être modifié.",
    });

  const save = (input: TestimonialInput) => {
    if (editing === "new") {
      run(createTestimonial, input, {
        success: "Témoignage créé",
        failure: "Le témoignage n'a pas pu être créé.",
        onSuccess: () => setEditing(null),
      });
    } else if (editing) {
      run(updateTestimonial, { id: editing.id, input }, {
        success: "Témoignage mis à jour",
        failure: "Le témoignage n'a pas pu être enregistré.",
        onSuccess: () => setEditing(null),
      });
    }
  };

  return (
    <div>
      <PageHead
        title="Témoignages clients"
        sub={`Section « Les retours de nos clients » - ${rows.filter((t) => t.active).length} affiché(s)`}
        action={<Btn onClick={() => setEditing("new")}><Plus /> Nouveau témoignage</Btn>}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((t) => (
          <Card key={t.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              {/* La vitrine n'affiche que la parole et le nom : le back-office
                  montre donc exactement ce que la cliente verra, sans photo ni
                  mention que personne ne lira. */}
              <p className="font-medium" style={{ color: "var(--adm-text)" }}>{t.author}</p>
              <button
                onClick={() => toggle(t)}
                title={t.active ? "Affiché sur le site" : "Masqué"}
                className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${t.active ? "bg-emerald-500" : ""}`}
                style={t.active ? undefined : { background: "var(--adm-border)" }}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${t.active ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            <p className="mt-3 flex-1 text-sm" style={{ color: "var(--adm-text)" }}>&ldquo;{t.text}&rdquo;</p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs" style={{ color: "var(--adm-muted)" }}>Position {t.position}</span>
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => setEditing(t)}><Edit /> Éditer</Btn>
                <Btn variant="ghost" onClick={() => setRemoving(t)}><Trash /></Btn>
              </div>
            </div>
          </Card>
        ))}
        {rows.length === 0 && (
          <Card className="p-10 text-center text-sm md:col-span-2 xl:col-span-3">
            <span style={{ color: "var(--adm-muted)" }}>Aucun témoignage pour le moment.</span>
          </Card>
        )}
      </div>

      {editing && (
        <TestimonialForm
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      {removing && (
        <ConfirmModal
          title="Supprimer le témoignage"
          message={`Le témoignage de ${removing.author} sera définitivement supprimé.`}
          confirmLabel="Supprimer"
          onConfirm={() =>
            run(deleteTestimonial, removing.id, {
              success: "Témoignage supprimé",
              failure: "Le témoignage n'a pas pu être supprimé.",
            })
          }
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
}

function TestimonialForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Testimonial | null;
  onClose: () => void;
  onSave: (input: TestimonialInput) => void;
}) {
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [text, setText] = useState(initial?.text ?? "");
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [active, setActive] = useState(initial?.active ?? true);

  /**
   * `role` et `avatar` ne sont plus saisis : la vitrine ne les affiche plus.
   * Les colonnes restent en base pour ne pas perdre ce qui y a deja ete
   * enregistre, mais on renvoie des valeurs vides plutot que de laisser un
   * champ que la boutique remplirait pour rien.
   */
  const submit = () =>
    onSave({
      author: author.trim(),
      role: "",
      text: text.trim(),
      avatar: null,
      position,
      active,
    });

  return (
    <Modal title={initial ? "Modifier le témoignage" : "Nouveau témoignage"} onClose={onClose}>
      <label className="block text-sm">
        <span style={{ color: "var(--adm-muted)" }}>Nom de la cliente</span>
        <Input value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1.5" placeholder="Awa Diallo" />
      </label>
      <label className="mt-4 block text-sm">
        <span style={{ color: "var(--adm-muted)" }}>Témoignage</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#c9a876]"
          style={{ background: "var(--adm-surface-2)", borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
          placeholder="Travailler avec HUWSTORE a tout changé…"
        />
      </label>
      <div className="mt-4 flex items-end gap-4">
        <label className="block flex-1 text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Position</span>
          <Input
            type="number"
            min={0}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="mt-1.5"
          />
        </label>
        <label className="flex items-center gap-2 pb-2.5 text-sm" style={{ color: "var(--adm-text)" }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Affiché sur le site
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn disabled={!author.trim() || !text.trim()} onClick={submit}>
          {initial ? "Enregistrer" : "Créer"}
        </Btn>
      </div>
    </Modal>
  );
}
