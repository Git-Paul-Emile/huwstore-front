import { useState, type FormEvent } from "react";
import { Card, PageHead, Pill, Btn, Input, Select, Modal, ConfirmModal, useUI } from "../../components/admin/ui";
import ImageField from "../../components/admin/ImageField";
import {
  useAllBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "../../hooks/useBanners";
import type { Banner, BannerInput } from "../../api/banners";
import { readApiError } from "../../api/axiosConfig";
import { Plus, Edit, Trash } from "../../components/icons";

/**
 * Bannières et campagnes.
 *
 * C'est d'ici que se pilote la vitrine : les slides « Hero » alimentent le
 * carrousel de la page d'accueil, le « Bandeau promo » la section campagne.
 * Rien n'est écrit en dur dans le code du site - changer la vitrine ne demande
 * donc aucune mise en ligne.
 */
const SLOT_HELP: Record<Banner["slot"], string> = {
  Hero: "Grand visuel du carrousel, en haut de la page d'accueil.",
  "Bandeau promo": "Bloc de campagne au milieu de la page d'accueil.",
  "Pop-up": "Fenêtre d'annonce (non affichée tant qu'elle n'est pas activée).",
};

const isLive = (banner: Banner) => {
  const now = Date.now();
  return banner.active && new Date(banner.start).getTime() <= now && new Date(banner.end).getTime() >= now;
};

export default function Banners() {
  const { toast } = useUI();
  const { data: banners = [], isLoading } = useAllBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const removeBanner = useDeleteBanner();

  const [editing, setEditing] = useState<Banner | "new" | null>(null);
  const [confirming, setConfirming] = useState<Banner | null>(null);

  return (
    <div>
      <PageHead
        title="Bannières & campagnes"
        sub="Carrousel d'accueil, bandeaux promotionnels et pop-ups"
        action={
          <Btn onClick={() => setEditing("new")}>
            <Plus /> Nouvelle bannière
          </Btn>
        }
      />

      <div className="space-y-3">
        {banners.map((banner) => (
          <Card key={banner.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <img src={banner.image} alt={banner.title} className="h-24 w-full rounded-lg object-cover sm:w-40" />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>
                  {banner.title}
                </h3>
                <Pill tone="gold">{banner.slot}</Pill>
                <Pill tone="blue">{banner.target}</Pill>
                <Pill tone={isLive(banner) ? "green" : "gray"}>{isLive(banner) ? "En ligne" : "Hors ligne"}</Pill>
              </div>
              {banner.subtitle && (
                <p className="mt-1 text-sm italic" style={{ color: "var(--adm-muted)" }}>{banner.subtitle}</p>
              )}
              <p className="mt-1 text-xs" style={{ color: "var(--adm-muted)" }}>
                Position {banner.position} - du {new Date(banner.start).toLocaleDateString("fr-FR")} au{" "}
                {new Date(banner.end).toLocaleDateString("fr-FR")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateBanner.mutate(
                    { id: banner.id, input: { active: !banner.active } },
                    { onSuccess: () => toast(banner.active ? "Bannière désactivée" : "Bannière activée") },
                  )
                }
                aria-label={banner.active ? "Désactiver" : "Activer"}
                className={`relative h-6 w-11 rounded-full transition-colors ${banner.active ? "bg-emerald-500" : ""}`}
                style={banner.active ? undefined : { background: "var(--adm-border)" }}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${banner.active ? "left-[22px]" : "left-0.5"}`}
                />
              </button>
              <Btn variant="ghost" onClick={() => setEditing(banner)}>
                <Edit /> Éditer
              </Btn>
              <Btn variant="ghost" onClick={() => setConfirming(banner)}>
                <Trash />
              </Btn>
            </div>
          </Card>
        ))}

        {!isLoading && banners.length === 0 && (
          <Card className="p-10 text-center text-sm">
            <span style={{ color: "var(--adm-muted)" }}>
              Aucune bannière. Sans slide « Hero », la page d'accueil commence directement par les catégories.
            </span>
          </Card>
        )}
      </div>

      {editing && (
        <BannerForm
          banner={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSubmit={(input, fail) => {
            const request =
              editing === "new"
                ? createBanner.mutateAsync(input)
                : updateBanner.mutateAsync({ id: editing.id, input });

            request
              .then(() => {
                toast(editing === "new" ? "Bannière créée" : "Bannière mise à jour");
                setEditing(null);
              })
              .catch((error) => fail(readApiError(error, "La bannière n'a pas pu être enregistrée.")));
          }}
        />
      )}

      {confirming && (
        <ConfirmModal
          title="Supprimer cette bannière ?"
          message={`« ${confirming.title} » sera définitivement supprimée.`}
          confirmLabel="Supprimer"
          onClose={() => setConfirming(null)}
          onConfirm={() =>
            removeBanner.mutate(confirming.id, {
              onSuccess: () => toast("Bannière supprimée"),
              onError: (error) => toast(readApiError(error, "Suppression impossible."), "error"),
            })
          }
        />
      )}
    </div>
  );
}

/** Date du jour au format attendu par <input type="date">. */
const isoDay = (value?: string) => (value ? new Date(value) : new Date()).toISOString().slice(0, 10);
const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

function BannerForm({
  banner,
  onClose,
  onSubmit,
}: {
  banner: Banner | null;
  onClose: () => void;
  onSubmit: (input: BannerInput, fail: (message: string) => void) => void;
}) {
  const [form, setForm] = useState({
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    text: banner?.text ?? "",
    ctaLabel: banner?.ctaLabel ?? "",
    ctaHref: banner?.ctaHref ?? "/boutique",
    slot: banner?.slot ?? ("Hero" as Banner["slot"]),
    target: banner?.target ?? ("Toutes" as Banner["target"]),
    focus: banner?.focus ?? ("center" as Banner["focus"]),
    position: banner?.position ?? 0,
    start: isoDay(banner?.start),
    end: banner ? isoDay(banner.end) : inDays(365),
    active: banner?.active ?? true,
    image: banner?.image ?? "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!form.image) return setError("Choisissez une image : c'est elle qu'on verra en premier.");
    if (new Date(form.end) <= new Date(form.start)) {
      return setError("La date de fin doit être postérieure à la date de début.");
    }

    onSubmit(
      {
        ...form,
        subtitle: form.subtitle.trim(),
        text: form.text.trim(),
        ctaLabel: form.ctaLabel.trim(),
        ctaHref: form.ctaHref.trim(),
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
      },
      setError,
    );
  }

  return (
    <Modal title={banner ? "Modifier la bannière" : "Nouvelle bannière"} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <ImageField
          value={form.image}
          onChange={(url) => set("image", url)}
          folder="bannieres"
          label="Visuel"
          hint="Format paysage conseillé, au moins 1600 px de large."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Titre</span>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required maxLength={80} className="mt-1.5" />
          </label>
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Deuxième ligne (en italique)</span>
            <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} maxLength={80} className="mt-1.5" />
          </label>
        </div>

        <label className="block text-sm">
          <span style={{ color: "var(--adm-muted)" }}>Texte</span>
          <Input value={form.text} onChange={(e) => set("text", e.target.value)} maxLength={240} className="mt-1.5" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Libellé du bouton</span>
            <Input
              value={form.ctaLabel}
              onChange={(e) => set("ctaLabel", e.target.value)}
              placeholder="Découvrir la collection"
              maxLength={40}
              className="mt-1.5"
            />
          </label>
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Destination du bouton</span>
            <Input value={form.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} placeholder="/boutique" className="mt-1.5" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Emplacement</span>
            <Select value={form.slot} onChange={(e) => set("slot", e.target.value as Banner["slot"])} className="mt-1.5">
              {(Object.keys(SLOT_HELP) as Banner["slot"][]).map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </Select>
            <span className="mt-1 block text-[0.7rem]" style={{ color: "var(--adm-muted)" }}>{SLOT_HELP[form.slot]}</span>
          </label>

          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Cadrage de la photo</span>
            <Select value={form.focus} onChange={(e) => set("focus", e.target.value as Banner["focus"])} className="mt-1.5">
              <option value="center">Centré</option>
              <option value="top">Haut de l'image</option>
              <option value="bottom">Bas de l'image</option>
            </Select>
          </label>

          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Ordre dans le carrousel</span>
            <Input type="number" min={0} value={form.position} onChange={(e) => set("position", Number(e.target.value))} className="mt-1.5" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Début de diffusion</span>
            <Input type="date" value={form.start} onChange={(e) => set("start", e.target.value)} required className="mt-1.5" />
          </label>
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Fin de diffusion</span>
            <Input type="date" value={form.end} onChange={(e) => set("end", e.target.value)} required className="mt-1.5" />
          </label>
          <label className="block text-sm">
            <span style={{ color: "var(--adm-muted)" }}>Affichage</span>
            <Select value={form.target} onChange={(e) => set("target", e.target.value as Banner["target"])} className="mt-1.5">
              <option value="Toutes">Tous les écrans</option>
              <option value="Mobile">Mobile seulement</option>
              <option value="Desktop">Ordinateur seulement</option>
            </Select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--adm-text)" }}>
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4" />
          Bannière active
        </label>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn type="submit">{banner ? "Enregistrer" : "Créer la bannière"}</Btn>
        </div>
      </form>
    </Modal>
  );
}
