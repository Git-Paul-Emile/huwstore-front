import { useState } from "react";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, useUI, fcfa, th, td } from "../../components/admin/ui";
import { useCreatePromo, usePromos, useUpdatePromo } from "../../hooks/usePromos";
import type { Promo, PromoInput } from "../../api/promos";
import { Plus } from "../../components/icons";

export default function Promos() {
  const { toast } = useUI();
  const { data: rows = [] } = usePromos();
  const createPromo = useCreatePromo();
  const updatePromo = useUpdatePromo();
  const [open, setOpen] = useState(false);

  const val = (p: Promo) =>
    p.type === "Pourcentage" ? `-${p.value}%` : p.type === "Montant fixe" ? `-${fcfa(p.value)}` : "Livraison offerte";

  return (
    <div>
      <PageHead
        title="Promotions & codes promo"
        sub={`${rows.filter((p) => p.active).length} code(s) actif(s)`}
        action={<Btn onClick={() => setOpen(true)}><Plus /> Créer un code</Btn>}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
              <tr>
                <th className={th}>Code</th><th className={th}>Type</th><th className={th}>Panier min.</th>
                <th className={th}>Utilisations</th><th className={th}>Expire le</th><th className={th}>Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--adm-hover)]">
                  <td className={td}><span className="font-mono font-semibold tracking-wide" style={{ color: "var(--adm-text)" }}>{p.code}</span></td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>{val(p)}</td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{p.minCart ? fcfa(p.minCart) : "—"}</td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: "var(--adm-hover)" }}>
                        <div className="h-full rounded-full bg-[#c9a876]" style={{ width: `${(p.used / p.limit) * 100}%` }} />
                      </div>
                      {p.used}/{p.limit}
                    </div>
                  </td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{new Date(p.end).toLocaleDateString("fr-FR")}</td>
                  <td className={td}>
                    <button onClick={() => updatePromo.mutate({ id: p.id, input: { active: !p.active } }, { onSuccess: () => toast("Code mis à jour") })}>
                      <Pill tone={p.active ? "green" : "gray"}>{p.active ? "Actif" : "Inactif"}</Pill>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <PromoForm
          onClose={() => setOpen(false)}
          onSave={(input) => createPromo.mutate(input, { onSuccess: () => { toast("Code promo créé"); setOpen(false); } })}
        />
      )}
    </div>
  );
}

function PromoForm({ onClose, onSave }: { onClose: () => void; onSave: (p: PromoInput) => void }) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<Promo["type"]>("Pourcentage");
  const [value, setValue] = useState(10);
  const [minCart, setMinCart] = useState(0);
  const [end, setEnd] = useState("2026-12-31");

  return (
    <Modal title="Nouveau code promo" onClose={onClose}>
      <label className="block text-sm">
        <span style={{ color: "var(--adm-muted)" }}>Code</span>
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="mt-1.5 font-mono" placeholder="RENTREE2026" />
      </label>
      <label className="mt-4 block text-sm">
        <span style={{ color: "var(--adm-muted)" }}>Type</span>
        <Select value={type} onChange={(e) => setType(e.target.value as Promo["type"])} className="mt-1.5">
          <option>Pourcentage</option><option>Montant fixe</option><option>Livraison offerte</option>
        </Select>
      </label>
      {type !== "Livraison offerte" && (
        <label className="mt-4 block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>{type === "Pourcentage" ? "Réduction (%)" : "Montant (FCFA)"}</span>
          <Input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} className="mt-1.5" />
        </label>
      )}
      <label className="mt-4 block text-sm">
        <span style={{ color: "var(--adm-muted)" }}>Panier minimum (FCFA)</span>
        <Input type="number" value={minCart} onChange={(e) => setMinCart(Number(e.target.value))} className="mt-1.5" />
      </label>
      <label className="mt-4 block text-sm">
        <span style={{ color: "var(--adm-muted)" }}>Date de validité</span>
        <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1.5" />
      </label>
      <div className="mt-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn disabled={!code} onClick={() => onSave({ code, type, value, minCart, limit: 500, end, active: true })}>Créer</Btn>
      </div>
    </Modal>
  );
}
