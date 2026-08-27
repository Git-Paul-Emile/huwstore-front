import { useMemo, useState } from "react";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, useUI, fcfa, th, td } from "../../components/admin/ui";
import { useClients } from "../../hooks/useClients";
import { useOrders } from "../../hooks/useOrders";
import type { Client } from "../../api/clients";
import { Search, Download } from "../../components/icons";

const segTone = (s: Client["segment"]) =>
  s === "VIP" ? "gold" : s === "Fidèle" ? "green" : s === "Nouveau" ? "blue" : "gray";

export default function Clients() {
  const { toast } = useUI();
  const { data: clients = [] } = useClients();
  const { data: orders = [] } = useOrders();
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState("all");
  const [open, setOpen] = useState<Client | null>(null);

  const filtered = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) && (seg === "all" || c.segment === seg)),
    [clients, q, seg],
  );

  return (
    <div>
      <PageHead
        title="Clients"
        sub={`${clients.length} clients enregistrés`}
        action={<Btn variant="ghost" onClick={() => toast("Export clients généré (consentement respecté)")}><Download /> Exporter</Btn>}
      />

      <div className="mb-4 grid grid-cols-4 gap-3">
        {(["VIP", "Fidèle", "Nouveau", "Inactif"] as const).map((s) => (
          <Card key={s} className="p-4">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>{s}</p>
            <p className="serif mt-1 text-xl" style={{ color: "var(--adm-text)" }}>{clients.filter((c) => c.segment === s).length}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--adm-muted)" }}><Search /></span>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un client…" className="pl-9" />
          </div>
          <Select value={seg} onChange={(e) => setSeg(e.target.value)}>
            <option value="all">Tous segments</option>
            <option>VIP</option><option>Fidèle</option><option>Nouveau</option><option>Inactif</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead style={{ background: "var(--adm-surface-2)", color: "var(--adm-muted)" }}>
              <tr>
                <th className={th}>Client</th><th className={th}>Contact</th><th className={th}>Ville</th>
                <th className={th}>Commandes</th><th className={th}>Total dépensé</th><th className={th}>Segment</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
              {filtered.map((c) => (
                <tr key={c.id} className="cursor-pointer hover:bg-[var(--adm-hover)]" onClick={() => setOpen(c)}>
                  <td className={td}><span className="font-medium" style={{ color: "var(--adm-text)" }}>{c.name}</span></td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{c.phone}</td>
                  <td className={td} style={{ color: "var(--adm-muted)" }}>{c.city ?? "-"}</td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>{c.orders}</td>
                  <td className={td} style={{ color: "var(--adm-text)" }}>{fcfa(c.spent)}</td>
                  <td className={td}><Pill tone={segTone(c.segment)}>{c.segment}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <Modal title={open.name} onClose={() => setOpen(null)} wide>
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Téléphone / WhatsApp" value={open.phone} />
            <Info label="Email" value={open.email ?? "-"} />
            <Info label="Ville" value={open.city ?? "-"} />
            <Info label="Client depuis" value={new Date(open.since).toLocaleDateString("fr-FR")} />
            <Info label="Commandes" value={String(open.orders)} />
            <Info label="Total dépensé" value={fcfa(open.spent)} />
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>Historique des commandes</p>
            <div className="space-y-2">
              {orders.filter((o) => o.client === open.name).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: "var(--adm-border)" }}>
                  <span style={{ color: "var(--adm-text)" }}>{o.id}</span>
                  <span style={{ color: "var(--adm-muted)" }}>{o.method}</span>
                  <span style={{ color: "var(--adm-text)" }}>{fcfa(o.total)}</span>
                  <Pill tone={o.status === "Livrée" ? "green" : o.status === "Retournée" ? "red" : "blue"}>{o.status}</Pill>
                </div>
              ))}
              {orders.filter((o) => o.client === open.name).length === 0 && (
                <p className="text-sm" style={{ color: "var(--adm-muted)" }}>Aucune commande récente.</p>
              )}
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>Note interne (SAV)</p>
            <textarea
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#c9a876]"
              style={{ background: "var(--adm-surface-2)", borderColor: "var(--adm-border)", color: "var(--adm-text)" }}
              rows={2} placeholder="Ajouter une note…"
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Btn onClick={() => { toast("Note enregistrée"); setOpen(null); }}>Enregistrer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "var(--adm-border)" }}>
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>{label}</p>
      <p className="mt-1 text-sm font-medium" style={{ color: "var(--adm-text)" }}>{value}</p>
    </div>
  );
}
