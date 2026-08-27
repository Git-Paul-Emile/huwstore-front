import { useState } from "react";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, useUI, th, td } from "../../components/admin/ui";
import { useAdjustStock, useStock, useStockMovements } from "../../hooks/useStock";
import { Download, Alert } from "../../components/icons";

export default function Stock() {
  const { toast } = useUI();
  const { data: stock = [] } = useStock();
  const { data: movements = [] } = useStockMovements();
  const adjustStock = useAdjustStock();
  const [adjust, setAdjust] = useState<string | null>(null);

  const tone = (qty: number, threshold: number) => (qty === 0 ? "red" : qty <= threshold ? "amber" : "green");
  const critical = stock.filter((s) => s.qty <= s.threshold);
  const adjustingRow = stock.find((s) => s.variantId === adjust);

  return (
    <div>
      <PageHead
        title="Gestion de stock"
        sub={`${critical.length} référence(s) à surveiller`}
        action={<Btn variant="ghost" onClick={() => toast("Export CSV généré")}><Download /> Exporter (CSV)</Btn>}
      />

      {critical.length > 0 && (
        <Card className="mb-4 flex items-start gap-3 border-l-4 border-l-amber-500 p-4">
          <span className="mt-0.5 text-amber-500"><Alert /></span>
          <p className="text-sm" style={{ color: "var(--adm-text)" }}>
            <b>Stock critique :</b> {critical.map((s) => `${s.product} (${s.color})`).join(", ")}. Notification envoyée au gestionnaire de stock.
          </p>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
              <tr>
                <th className={th}>Produit</th>
                <th className={th}>Coloris</th>
                <th className={th}>Stock</th>
                <th className={th}>Seuil d'alerte</th>
                <th className={th}>État</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {stock.map((s) => (
                <tr key={s.variantId} className="hover:bg-[var(--adm-hover)]">
                  <td className={td}>
                    <span className="font-medium" style={{ color: "var(--adm-text)" }}>{s.product}</span>
                    <span className="block text-xs" style={{ color: "var(--adm-muted)" }}>{s.sku}</span>
                  </td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{s.color}</td>
                  <td className={`${td} tabular-nums`} style={{ color: "var(--adm-text)" }}>{s.qty}</td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{s.threshold}</td>
                  <td className={td}>
                    <Pill tone={tone(s.qty, s.threshold)}>{s.qty === 0 ? "Rupture" : s.qty <= s.threshold ? "Faible" : "Suffisant"}</Pill>
                  </td>
                  <td className={`${td} text-right`}>
                    <Btn variant="ghost" onClick={() => setAdjust(s.variantId)}>Ajuster</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="border-b p-5" style={{ borderColor: "var(--adm-border)" }}>
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Historique des mouvements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
              <tr><th className={th}>Date</th><th className={th}>Produit</th><th className={th}>Type</th><th className={th}>Qté</th><th className={th}>Motif</th><th className={th}>Auteur</th></tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{new Date(m.date).toLocaleString("fr-FR")}</td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>{m.product}</td>
                  <td className={td}><Pill tone={m.type === "Entrée" ? "green" : m.type === "Vente" ? "blue" : "amber"}>{m.type}</Pill></td>
                  <td className={`${td} tabular-nums ${m.qty < 0 ? "text-rose-500" : "text-emerald-600"}`}>{m.qty > 0 ? `+${m.qty}` : m.qty}</td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{m.reason}</td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{m.author}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr><td className={td} colSpan={6} style={{ color: "var(--adm-muted)" }}>Aucun mouvement enregistré.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {adjust && adjustingRow && (
        <AdjustModal
          name={adjustingRow.product}
          current={adjustingRow.qty}
          onClose={() => setAdjust(null)}
          onSave={(qty, reason) => {
            const delta = qty - adjustingRow.qty;
            adjustStock.mutate(
              { variantId: adjust, type: "Ajustement", qty: delta, reason, author: "Admin" },
              { onSuccess: () => toast("Stock ajusté") },
            );
            setAdjust(null);
          }}
        />
      )}
    </div>
  );
}

function AdjustModal({ name, current, onClose, onSave }: { name: string; current: number; onClose: () => void; onSave: (qty: number, reason: string) => void }) {
  const [qty, setQty] = useState(current);
  const [reason, setReason] = useState("");
  return (
    <Modal title={`Ajuster le stock - ${name}`} onClose={onClose}>
      <label className="block text-sm">
        <span style={{ color: "var(--adm-muted)" }}>Nouvelle quantité en stock</span>
        <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1.5" />
      </label>
      <label className="mt-4 block text-sm">
        <span style={{ color: "var(--adm-muted)" }}>Motif (obligatoire)</span>
        <Select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5">
          <option value="">Sélectionner…</option>
          <option>Inventaire physique</option><option>Casse</option><option>Retour client</option><option>Erreur de saisie</option><option>Réassort</option>
        </Select>
      </label>
      <div className="mt-6 flex justify-end gap-3">
        <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
        <Btn onClick={() => onSave(qty, reason)} disabled={!reason || qty === current}>Valider l'ajustement</Btn>
      </div>
    </Modal>
  );
}
