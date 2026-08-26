import { useMemo, useState } from "react";
import { Card, PageHead, Pill, Btn, Select, Modal, useUI, fcfa, th, td } from "../../components/admin/ui";
import { useOrders, useUpdateOrder } from "../../hooks/useOrders";
import type { Order, OrderStatus } from "../../api/orders";
import { Download, Truck, Check } from "../../components/icons";

const flow: OrderStatus[] = ["En préparation", "Expédiée", "En cours de livraison", "Livrée"];
const payTone = (p: Order["pay"]) => (p === "Payé" ? "green" : p === "En attente" ? "amber" : "red");
const statusTone = (s: OrderStatus) =>
  s === "Livrée" ? "green" : s === "Retournée" ? "red" : s === "En préparation" ? "amber" : "blue";

export default function Orders() {
  const { toast } = useUI();
  const { data: rows = [] } = useOrders();
  const updateOrder = useUpdateOrder();
  const [pay, setPay] = useState("all");
  const [status, setStatus] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () => rows.filter((o) => (pay === "all" || o.pay === pay) && (status === "all" || o.status === status)),
    [rows, pay, status],
  );
  const open = rows.find((o) => o.id === openId) ?? null;

  const advance = (o: Order) => {
    const i = flow.indexOf(o.status);
    if (i < 0 || i >= flow.length - 1) return;
    const next = flow[i + 1];
    updateOrder.mutate(
      { id: o.id, input: { status: next } },
      { onSuccess: () => toast(`${o.id} → ${next} · notification WhatsApp envoyée au client`) },
    );
  };

  return (
    <div>
      <PageHead
        title="Commandes & livraison"
        sub={`${rows.length} commandes`}
        action={<Btn variant="ghost" onClick={() => toast("Rapport commandes exporté")}><Download /> Exporter</Btn>}
      />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={pay} onChange={(e) => setPay(e.target.value)}>
            <option value="all">Tous paiements</option>
            <option>Payé</option><option>En attente</option><option>Échoué</option>
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tous statuts livraison</option>
            {flow.concat("Retournée").map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
              <tr>
                <th className={th}>N°</th><th className={th}>Client</th><th className={th}>Montant</th>
                <th className={th}>Paiement</th><th className={th}>Livraison</th><th className={th}>Transporteur</th>
                <th className={`${th} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--adm-hover)]">
                  <td className={td}><span className="font-medium" style={{ color: "var(--adm-text)" }}>{o.id}</span></td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{o.client}<br /><span className="text-xs">{o.city}</span></td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>{fcfa(o.total)}</td>
                  <td className={td}><Pill tone={payTone(o.pay)}>{o.pay}</Pill><br /><span className="mt-1 inline-block text-xs" style={{ color: "var(--adm-muted)" }}>{o.method}</span></td>
                  <td className={td}><Pill tone={statusTone(o.status)}>{o.status}</Pill></td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{o.courier ?? "—"}{o.tracking && <><br /><span className="text-xs">{o.tracking}</span></>}</td>
                  <td className={`${td} text-right`}><Btn variant="ghost" onClick={() => setOpenId(o.id)}>Détail</Btn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <Modal title={`Commande ${open.id}`} onClose={() => setOpenId(null)} wide>
          {/* Timeline suivi */}
          <div className="mb-6 flex items-center justify-between">
            {flow.map((s, i) => {
              const done = flow.indexOf(open.status) >= i;
              return (
                <div key={s} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && <div className="h-0.5 flex-1" style={{ background: done ? "#c9a876" : "var(--adm-border)" }} />}
                    <div className={`grid h-8 w-8 place-items-center rounded-full text-xs ${done ? "bg-[#c9a876] text-white" : ""}`} style={done ? undefined : { background: "var(--adm-hover)", color: "var(--adm-muted)" }}>
                      {done ? <Check /> : i + 1}
                    </div>
                    {i < flow.length - 1 && <div className="h-0.5 flex-1" style={{ background: flow.indexOf(open.status) > i ? "#c9a876" : "var(--adm-border)" }} />}
                  </div>
                  <span className="mt-2 text-center text-[0.65rem]" style={{ color: "var(--adm-muted)" }}>{s}</span>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--adm-border)" }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>Client</p>
              <p className="mt-1 text-sm" style={{ color: "var(--adm-text)" }}>{open.client} · {open.city}, {open.country}</p>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--adm-border)" }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>Paiement</p>
              <p className="mt-1 text-sm" style={{ color: "var(--adm-text)" }}>{open.method} — <Pill tone={payTone(open.pay)}>{open.pay}</Pill></p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border" style={{ borderColor: "var(--adm-border)" }}>
            {open.items.map((it, i) => (
              <div key={i} className="flex justify-between border-b px-4 py-2.5 text-sm last:border-0" style={{ borderColor: "var(--adm-border)" }}>
                <span style={{ color: "var(--adm-text)" }}>{it.name} × {it.qty}</span>
                <span style={{ color: "var(--adm-muted)" }}>{fcfa(it.price * it.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between px-4 py-2.5 text-sm font-semibold" style={{ color: "var(--adm-text)" }}>
              <span>Total</span><span>{fcfa(open.total)}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span style={{ color: "var(--adm-muted)" }}>Transporteur / livreur</span>
              <Select
                value={open.courier ?? "—"}
                onChange={(e) => updateOrder.mutate({ id: open.id, input: { courier: e.target.value } })}
                className="mt-1.5"
              >
                <option>—</option><option>Livreur interne · Moussa</option><option>DHL Express</option><option>Prestataire · Chronopost</option>
              </Select>
            </label>
            <div className="flex items-end gap-2">
              <Btn variant="ghost" onClick={() => toast("Facture PDF générée")}>Facture PDF</Btn>
              <Btn onClick={() => advance(open)} disabled={open.status === "Livrée" || open.status === "Retournée"}>
                <Truck /> Étape suivante
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
