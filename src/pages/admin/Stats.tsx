import { useState } from "react";
import { Card, PageHead, Btn, useUI, fcfa } from "../../components/admin/ui";
import { useOverview, useSalesByCategory, useTopProducts } from "../../hooks/useStats";
import { exportOrdersCsv } from "../../api/orders";
import { Download } from "../../components/icons";
import { downloadBlob, stampedName } from "../../utils/download";

export default function Stats() {
  const { toast } = useUI();
  const [period, setPeriod] = useState("30");
  const { data: salesByCategory = [] } = useSalesByCategory();
  // Chiffres agrégés en base : justes même au-delà de quelques centaines de commandes.
  const { data: overview } = useOverview(Number(period));
  const { data: top = [] } = useTopProducts(Number(period), 5);

  const categoryTotal = salesByCategory.reduce((n, c) => n + c.value, 0) || 1;

  async function exportReport() {
    try {
      const blob = await exportOrdersCsv();
      downloadBlob(blob, stampedName("rapport-commandes"));
      toast("Rapport téléchargé");
    } catch {
      toast("Le rapport n'a pas pu être généré");
    }
  }

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
            <Btn variant="ghost" onClick={exportReport}><Download /> Exporter</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: "Chiffre d'affaires encaissé", v: fcfa(overview?.paidRevenue ?? 0) },
          { l: "Panier moyen", v: fcfa(overview?.avgBasket ?? 0) },
          { l: "Commandes", v: String(overview?.orders ?? 0) },
          { l: "Articles vendus", v: String(overview?.itemsSold ?? 0) },
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
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Sacs les plus vendus</h3>
          <p className="mt-1 text-xs" style={{ color: "var(--adm-muted)" }}>
            Classement par quantité réellement vendue sur {period} jours.
          </p>
          <div className="mt-4 space-y-3">
            {top.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="serif text-lg" style={{ color: "var(--adm-muted)" }}>{i + 1}</span>
                {p.image && <img src={p.image} alt="" className="h-10 w-8 rounded object-cover" />}
                <span className="flex-1 text-sm" style={{ color: "var(--adm-text)" }}>
                  {p.name}
                  <span className="block text-xs" style={{ color: "var(--adm-muted)" }}>{p.category}</span>
                </span>
                <span className="text-right text-sm" style={{ color: "var(--adm-text)" }}>
                  {p.qtySold} vendu{p.qtySold > 1 ? "s" : ""}
                  <span className="block text-xs" style={{ color: "var(--adm-muted)" }}>{fcfa(p.revenue)}</span>
                </span>
              </div>
            ))}
            {top.length === 0 && (
              <p className="text-sm" style={{ color: "var(--adm-muted)" }}>Pas encore de vente sur la période.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
