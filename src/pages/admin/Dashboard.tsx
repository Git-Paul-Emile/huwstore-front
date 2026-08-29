import { Card, PageHead, Pill, fcfa } from "../../components/admin/ui";
import { useDashboardStats, useSales7Days, useSalesByCategory } from "../../hooks/useStats";
import { useOrders } from "../../hooks/useOrders";
import { useStock } from "../../hooks/useStock";
import { useShop } from "../../hooks/useSettings";
import { Trend, Alert } from "../../components/icons";

function Kpi({ label, value, delta, tone }: { label: string; value: string; delta?: string; tone?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>{label}</p>
      <p className="serif mt-2 text-2xl" style={{ color: "var(--adm-text)" }}>{value}</p>
      {delta && (
        <p className={`mt-1.5 inline-flex items-center gap-1 text-xs ${tone ?? "text-emerald-600"}`}>
          <Trend /> {delta}
        </p>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats } = useDashboardStats();
  const { data: sales7 = [] } = useSales7Days();
  const { data: salesByCategory = [] } = useSalesByCategory();
  const { data: orders = [] } = useOrders();
  const { data: stock = [] } = useStock();
  const shop = useShop();

  const lowStock = stock.filter((s) => s.qty <= s.threshold);
  const max = Math.max(1, ...sales7.map((s) => s.value));

  return (
    <div>
      <PageHead title="Tableau de bord" sub={`Vue d'ensemble du jour - ${shop.shopName}`} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="CA aujourd'hui" value={fcfa(stats?.revenueToday ?? 0)} />
        <Kpi label="Commandes en attente" value={String(stats?.pendingOrders ?? 0)} delta="À traiter" tone="text-amber-600" />
        <Kpi label="Produits en stock faible" value={String(stats?.lowStockCount ?? 0)} delta="Vérifier" tone="text-rose-600" />
        <Kpi label="Nouveaux clients" value={String(stats?.newClientsToday ?? 0)} delta="aujourd'hui" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Graphique ventes */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Ventes - 7 derniers jours</h3>
            <span className="text-xs" style={{ color: "var(--adm-muted)" }}>en milliers de FCFA</span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-3">
            {sales7.map((s) => (
              <div key={s.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-[#c9a876] transition-all hover:bg-[#b8935a]"
                    style={{ height: `${(s.value / max) * 100}%` }}
                    title={`${s.value}k FCFA`}
                  />
                </div>
                <span className="text-xs" style={{ color: "var(--adm-muted)" }}>{s.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertes */}
        <Card className="p-5">
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Alertes</h3>
          <ul className="mt-4 space-y-3">
            {lowStock.slice(0, 3).map((s) => (
              <li key={s.variantId} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 text-rose-500"><Alert /></span>
                <span style={{ color: "var(--adm-text)" }}>
                  <b>{s.product}</b> - {s.qty === 0 ? "rupture de stock" : `stock faible (${s.qty})`}
                </span>
              </li>
            ))}
            {lowStock.length === 0 && <li className="text-sm" style={{ color: "var(--adm-muted)" }}>Aucune alerte de stock.</li>}
          </ul>
        </Card>
      </div>

      {/* Dernières commandes */}
      <Card className="mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--adm-border)" }}>
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Dernières commandes</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--adm-border)" }}>
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
              <div className="flex items-center gap-4">
                <span className="font-medium" style={{ color: "var(--adm-text)" }}>{o.id}</span>
                <span style={{ color: "var(--adm-muted)" }}>{o.client} - {o.city}</span>
              </div>
              <div className="flex items-center gap-4">
                <span style={{ color: "var(--adm-text)" }}>{fcfa(o.total)}</span>
                <Pill tone={o.pay === "Payé" ? "green" : o.pay === "En attente" ? "amber" : "red"}>{o.pay}</Pill>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="px-5 py-4 text-sm" style={{ color: "var(--adm-muted)" }}>Aucune commande.</p>}
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Ventes par catégorie <span className="text-xs font-normal" style={{ color: "var(--adm-muted)" }}>(30 derniers jours)</span></h3>
        <div className="mt-4 space-y-3">
          {salesByCategory.map((c) => {
            const total = salesByCategory.reduce((n, x) => n + x.value, 0) || 1;
            const pct = Math.round((c.value / total) * 100);
            return (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--adm-muted)" }}>
                  <span>{c.name}</span><span>{pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--adm-hover)" }}>
                  <div className="h-full rounded-full bg-[#c9a876]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {salesByCategory.length === 0 && <p className="text-sm" style={{ color: "var(--adm-muted)" }}>Pas encore de vente sur la période.</p>}
        </div>
      </Card>
    </div>
  );
}
