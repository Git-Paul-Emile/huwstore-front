import { useState } from "react";
import { Card, PageHead, Btn, useUI, fcfa } from "../../components/admin/ui";
import { useSalesByCategory } from "../../hooks/useStats";
import { useOrders } from "../../hooks/useOrders";
import { useProducts } from "../../hooks/useProducts";
import { Download } from "../../components/icons";

export default function Stats() {
  const { toast } = useUI();
  const [period, setPeriod] = useState("30");
  const { data: salesByCategory = [] } = useSalesByCategory();
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts();

  const ca = orders.reduce((n, o) => n + (o.pay === "Payé" ? o.total : 0), 0);
  const paidCount = orders.filter((o) => o.pay === "Payé").length;
  const avg = Math.round(ca / Math.max(1, paidCount));
  const top = products.slice(0, 5);
  const categoryTotal = salesByCategory.reduce((n, c) => n + c.value, 0) || 1;

  return (
    <div>
      <PageHead
        title="Statistiques & rapports"
        sub="Performances de la boutique"
        action={
          <div className="flex gap-2">
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm" style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)", color: "var(--adm-text)" }}>
              <option value="7">7 jours</option><option value="30">30 jours</option><option value="90">90 jours</option>
            </select>
            <Btn variant="ghost" onClick={() => toast("Rapport exporté")}><Download /> Rapport</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: "Chiffre d'affaires", v: fcfa(ca) },
          { l: "Panier moyen", v: fcfa(avg) },
          { l: "Taux de conversion", v: "3,8 %" },
          { l: "Commandes payées", v: String(paidCount) },
        ].map((k) => (
          <Card key={k.l} className="p-5">
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--adm-muted)" }}>{k.l}</p>
            <p className="serif mt-2 text-xl" style={{ color: "var(--adm-text)" }}>{k.v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Ventes par catégorie</h3>
          <div className="mt-4 space-y-3">
            {salesByCategory.map((c) => {
              const pct = Math.round((c.value / categoryTotal) * 100);
              return (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--adm-muted)" }}><span>{c.name}</span><span>{pct}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--adm-hover)" }}>
                    <div className="h-full rounded-full bg-[#c9a876]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {salesByCategory.length === 0 && <p className="text-sm" style={{ color: "var(--adm-muted)" }}>Pas encore de vente sur la période.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Top produits</h3>
          <div className="mt-4 space-y-3">
            {top.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="serif text-lg" style={{ color: "var(--adm-muted)" }}>{i + 1}</span>
                <img src={p.image} alt={p.imageAlt} className="h-10 w-8 rounded object-cover" />
                <span className="flex-1 text-sm" style={{ color: "var(--adm-text)" }}>{p.name}</span>
                <span className="text-sm" style={{ color: "var(--adm-muted)" }}>{fcfa(p.price)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
