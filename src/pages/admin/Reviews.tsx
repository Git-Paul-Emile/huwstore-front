import { useState } from "react";
import { Card, PageHead, Pill, Btn, useUI } from "../../components/admin/ui";
import { useReviews, useUpdateReviewStatus } from "../../hooks/useReviews";
import type { Review } from "../../api/reviews";
import { Star, Check, Close } from "../../components/icons";

export default function Reviews() {
  const { toast } = useUI();
  const { data: rows = [] } = useReviews();
  const updateStatus = useUpdateReviewStatus();
  const [tab, setTab] = useState<Review["status"]>("En attente");

  const set = (id: string, status: Review["status"]) => {
    updateStatus.mutate({ id, status }, { onSuccess: () => toast(status === "Publié" ? "Avis publié" : "Avis rejeté") });
  };
  const filtered = rows.filter((r) => r.status === tab);

  return (
    <div>
      <PageHead title="Avis clients" sub="Modération avant publication" />

      <div className="mb-4 flex gap-2">
        {(["En attente", "Publié", "Rejeté"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${tab === t ? "text-white" : ""}`}
            style={tab === t ? { background: "var(--adm-nav)" } : { background: "var(--adm-surface)", color: "var(--adm-muted)", border: "1px solid var(--adm-border)" }}
          >
            {t} ({rows.filter((r) => r.status === t).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="font-medium" style={{ color: "var(--adm-text)" }}>{r.author}</span>
                <span className="inline-flex text-[#c9a876]">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} filled={i <= r.rating} />)}
                </span>
                <Pill tone="gray">{r.product}</Pill>
              </div>
              <span className="text-xs" style={{ color: "var(--adm-muted)" }}>{new Date(r.date).toLocaleDateString("fr-FR")}</span>
            </div>
            <p className="mt-3 text-sm" style={{ color: "var(--adm-text)" }}>{r.text}</p>
            {r.status === "En attente" && (
              <div className="mt-4 flex gap-2">
                <Btn onClick={() => set(r.id, "Publié")}><Check /> Publier</Btn>
                <Btn variant="ghost" onClick={() => set(r.id, "Rejeté")}><Close /> Rejeter</Btn>
                <Btn variant="ghost" onClick={() => toast("Réponse envoyée au client")}>Répondre</Btn>
              </div>
            )}
          </Card>
        ))}
        {filtered.length === 0 && <Card className="p-10 text-center text-sm"><span style={{ color: "var(--adm-muted)" }}>Aucun avis {tab.toLowerCase()}.</span></Card>}
      </div>
    </div>
  );
}
