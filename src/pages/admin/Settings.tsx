import { useState } from "react";
import { Card, PageHead, Pill, Btn, Input, useUI, fcfa } from "../../components/admin/ui";
import { useDeliveryZones } from "../../hooks/useDeliveryZones";
import { SHOP_PHONE_DISPLAY } from "../../data";

const roles = [
  { name: "Super-admin", desc: "Accès complet à tous les modules", who: "A. Diallo", tone: "gold" },
  { name: "Gestionnaire stock", desc: "Produits, stock, mouvements", who: "M. Fall", tone: "blue" },
  { name: "Gestionnaire SAV", desc: "Clients, avis, commandes", who: "F. Sarr", tone: "green" },
];

const payments = ["Wave", "Orange Money", "Paiement à la livraison", "Carte bancaire"];

export default function Settings() {
  const { toast } = useUI();
  const { data: deliveryZones = [] } = useDeliveryZones();
  const [pay, setPay] = useState<Record<string, boolean>>({ Wave: true, "Orange Money": true, "Paiement à la livraison": true, "Carte bancaire": false });

  return (
    <div>
      <PageHead title="Paramètres" sub="Configuration de la boutique #709666259" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Informations boutique</h3>
          <div className="mt-4 space-y-3">
            <label className="block text-sm"><span style={{ color: "var(--adm-muted)" }}>Nom</span><Input defaultValue="MW Store" className="mt-1.5" /></label>
            <label className="block text-sm"><span style={{ color: "var(--adm-muted)" }}>Téléphone / WhatsApp Business</span><Input defaultValue={SHOP_PHONE_DISPLAY} className="mt-1.5" /></label>
            <label className="block text-sm"><span style={{ color: "var(--adm-muted)" }}>Ville · Pays</span><Input defaultValue="Dakar · Sénégal" className="mt-1.5" /></label>
          </div>
          <Btn className="mt-4" onClick={() => toast("Informations enregistrées")}>Enregistrer</Btn>
        </Card>

        <Card className="p-5">
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Moyens de paiement</h3>
          <div className="mt-4 space-y-2">
            {payments.map((p) => (
              <label key={p} className="flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm" style={{ borderColor: "var(--adm-border)", color: "var(--adm-text)" }}>
                {p}
                <button
                  onClick={() => { setPay((s) => ({ ...s, [p]: !s[p] })); toast(`${p} ${!pay[p] ? "activé" : "désactivé"}`); }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${pay[p] ? "bg-emerald-500" : ""}`}
                  style={pay[p] ? undefined : { background: "var(--adm-border)" }}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${pay[p] ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Zones de livraison</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {deliveryZones.map((z) => (
              <div key={z.id} className="rounded-lg border p-3" style={{ borderColor: "var(--adm-border)" }}>
                <p className="font-medium" style={{ color: "var(--adm-text)" }}>{z.city}</p>
                <p className="text-xs" style={{ color: "var(--adm-muted)" }}>{z.country} · {z.delay}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--adm-text)" }}>{fcfa(z.fee)}</p>
                {z.relay && <Pill tone="blue">Relais dispo</Pill>}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Rôles administrateurs</h3>
          <div className="mt-4 space-y-2">
            {roles.map((r) => (
              <div key={r.name} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3" style={{ borderColor: "var(--adm-border)" }}>
                <div>
                  <div className="flex items-center gap-2"><span className="font-medium" style={{ color: "var(--adm-text)" }}>{r.name}</span><Pill tone={r.tone}>{r.who}</Pill></div>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--adm-muted)" }}>{r.desc}</p>
                </div>
                <Btn variant="ghost" onClick={() => toast("Permissions (démo)")}>Gérer</Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
