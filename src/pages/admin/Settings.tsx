import { useEffect, useState, type FormEvent } from "react";
import { Card, PageHead, Pill, Btn, Input, useUI, fcfa } from "../../components/admin/ui";
import {
  useCreateDeliveryZone,
  useDeleteDeliveryZone,
  useDeliveryZones,
  useUpdateDeliveryZone,
} from "../../hooks/useDeliveryZones";
import { useSettings, useUpdateSettings } from "../../hooks/useSettings";
import type { Settings as ShopSettings } from "../../api/settings";
import { readApiError } from "../../api/axiosConfig";

/**
 * Paramètres de la boutique.
 *
 * Deux blocs, et rien de décoratif :
 *  - les informations de la boutique, lues par la vitrine (pied de page,
 *    widget WhatsApp, bandeau d'annonce) et imprimées sur la facture ;
 *  - les zones de livraison, qui déterminent les frais réellement appliqués
 *    au panier et le seuil de gratuité.
 */
const EMPTY: ShopSettings = {
  shopName: "",
  phone: "",
  whatsapp: "",
  city: "",
  country: "",
};

export default function Settings() {
  const { toast } = useUI();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();

  const { data: deliveryZones = [] } = useDeliveryZones();
  const createZone = useCreateDeliveryZone();
  const updateZone = useUpdateDeliveryZone();
  const removeZone = useDeleteDeliveryZone();

  const [form, setForm] = useState<ShopSettings>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [zoneFormOpen, setZoneFormOpen] = useState(false);

  // Le formulaire est alimenté dès que les paramètres arrivent du serveur.
  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = <K extends keyof ShopSettings>(key: K, value: ShopSettings[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  function saveShop(event: FormEvent) {
    event.preventDefault();
    setError(null);
    updateSettings.mutate(form, {
      onSuccess: () => toast("Informations de la boutique enregistrées"),
      onError: (err) => setError(readApiError(err, "Les informations n'ont pas pu être enregistrées.")),
    });
  }

  function submitZone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    createZone.mutate(
      {
        city: String(data.get("city") ?? ""),
        country: String(data.get("country") ?? ""),
        fee: Number(data.get("fee") ?? 0),
        freeFrom: Number(data.get("freeFrom") ?? 0),
        delay: String(data.get("delay") ?? ""),
        relay: data.get("relay") === "on",
      },
      {
        onSuccess: () => {
          setZoneFormOpen(false);
          toast("Zone de livraison ajoutée");
        },
        onError: (err) => toast(readApiError(err, "La zone n'a pas pu être ajoutée."), "error"),
      },
    );
  }

  return (
    <div>
      <PageHead title="Paramètres" sub="Informations de la boutique et zones de livraison" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 lg:col-span-2">
          <form onSubmit={saveShop}>
            <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Informations de la boutique</h3>
            <p className="mt-1 text-xs" style={{ color: "var(--adm-muted)" }}>
              Ces informations apparaissent sur le site (pied de page, WhatsApp) et sur les factures.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Nom de la boutique" value={form.shopName} onChange={(v) => set("shopName", v)} required />
              <Field
                label="Téléphone affiché"
                value={form.phone}
                onChange={(v) => set("phone", v)}
                hint="Tel qu'il doit apparaître sur le site."
                required
              />
              <Field
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(v) => set("whatsapp", v)}
                hint="Format international sans « + », ex. 221709666259."
                required
              />
              <Field label="E-mail de contact" value={form.email ?? ""} onChange={(v) => set("email", v)} type="email" />
              <Field label="Ville" value={form.city} onChange={(v) => set("city", v)} required />
              <Field label="Pays" value={form.country} onChange={(v) => set("country", v)} required />
              <Field
                label="Adresse (facture)"
                value={form.addressLine ?? ""}
                onChange={(v) => set("addressLine", v)}
                hint="Facultative, imprimée sur la facture."
              />
              <Field
                label="NINEA"
                value={form.ninea ?? ""}
                onChange={(v) => set("ninea", v)}
                hint="Une fois renseigné, il remplace la mention « TVA non applicable »."
              />
              <Field
                label="Bandeau d'annonce"
                value={form.announcement ?? ""}
                onChange={(v) => set("announcement", v)}
                hint="Affiché en haut du site. Videz le champ pour le retirer."
              />
              <Field label="Instagram" value={form.instagramUrl ?? ""} onChange={(v) => set("instagramUrl", v)} placeholder="https://instagram.com/…" />
              <Field label="Facebook" value={form.facebookUrl ?? ""} onChange={(v) => set("facebookUrl", v)} placeholder="https://facebook.com/…" />
              <Field label="TikTok" value={form.tiktokUrl ?? ""} onChange={(v) => set("tiktokUrl", v)} placeholder="https://tiktok.com/@…" />
            </div>

            {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}

            <Btn type="submit" className="mt-5" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Enregistrement…" : "Enregistrer"}
            </Btn>
          </form>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Encaissement</h3>
          <p className="mt-3 text-sm" style={{ color: "var(--adm-muted)" }}>
            La boutique encaisse uniquement <strong style={{ color: "var(--adm-text)" }}>à la livraison</strong>, en
            espèces. Aucun paiement en ligne n'est proposé et aucune coordonnée bancaire n'est collectée - ni sur le
            site, ni en base.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-lg border px-4 py-3" style={{ borderColor: "var(--adm-border)" }}>
            <span className="font-medium" style={{ color: "var(--adm-text)" }}>Paiement à la livraison</span>
            <Pill tone="green">Actif</Pill>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>Zones de livraison</h3>
              <p className="mt-1 text-xs" style={{ color: "var(--adm-muted)" }}>
                Les frais et le seuil de gratuité appliqués au panier viennent d'ici.
              </p>
            </div>
            <Btn variant="ghost" onClick={() => setZoneFormOpen((open) => !open)}>
              {zoneFormOpen ? "Annuler" : "Ajouter une zone"}
            </Btn>
          </div>

          {zoneFormOpen && (
            <form onSubmit={submitZone} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <ZoneField label="Ville" name="city" required />
              <ZoneField label="Pays" name="country" defaultValue="Sénégal" required />
              <ZoneField label="Frais (FCFA)" name="fee" type="number" min={0} defaultValue={2000} required />
              <ZoneField label="Offerte dès (FCFA)" name="freeFrom" type="number" min={0} defaultValue={75000} required />
              <ZoneField label="Délai" name="delay" defaultValue="24 h" required />
              <label className="flex items-end gap-2 text-sm" style={{ color: "var(--adm-text)" }}>
                <input type="checkbox" name="relay" className="h-4 w-4" /> Point relais
              </label>
              <div className="lg:col-span-6">
                <Btn type="submit" disabled={createZone.isPending}>
                  {createZone.isPending ? "Enregistrement…" : "Enregistrer la zone"}
                </Btn>
              </div>
            </form>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {deliveryZones.map((zone) => (
              <div key={zone.id} className="rounded-lg border p-3" style={{ borderColor: "var(--adm-border)" }}>
                <p className="font-medium" style={{ color: "var(--adm-text)" }}>{zone.city}</p>
                <p className="text-xs" style={{ color: "var(--adm-muted)" }}>{zone.country} - {zone.delay}</p>

                <label className="mt-2 block text-xs" style={{ color: "var(--adm-muted)" }}>
                  Frais
                  <Input
                    type="number"
                    min={0}
                    defaultValue={zone.fee}
                    className="mt-1"
                    onBlur={(e) => {
                      const fee = Number(e.target.value);
                      if (fee !== zone.fee) {
                        updateZone.mutate({ id: zone.id, input: { fee } }, { onSuccess: () => toast(`Frais ${zone.city} mis à jour`) });
                      }
                    }}
                  />
                </label>
                <label className="mt-2 block text-xs" style={{ color: "var(--adm-muted)" }}>
                  Offerte dès
                  <Input
                    type="number"
                    min={0}
                    defaultValue={zone.freeFrom}
                    className="mt-1"
                    onBlur={(e) => {
                      const freeFrom = Number(e.target.value);
                      if (freeFrom !== zone.freeFrom) {
                        updateZone.mutate({ id: zone.id, input: { freeFrom } }, { onSuccess: () => toast(`Seuil ${zone.city} mis à jour`) });
                      }
                    }}
                  />
                </label>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--adm-text)" }}>{fcfa(zone.fee)}</span>
                  {zone.relay && <Pill tone="blue">Relais dispo</Pill>}
                </div>
                <button
                  onClick={() => removeZone.mutate(zone.id, { onSuccess: () => toast(`Zone ${zone.city} supprimée`) })}
                  className="mt-2 text-xs text-rose-500 hover:underline"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block text-sm">
      <span style={{ color: "var(--adm-muted)" }}>{label}</span>
      <Input {...props} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
      {hint && <span className="mt-1 block text-[0.7rem]" style={{ color: "var(--adm-muted)" }}>{hint}</span>}
    </label>
  );
}

function ZoneField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-xs" style={{ color: "var(--adm-muted)" }}>
      {label}
      <Input {...props} className="mt-1" />
    </label>
  );
}
