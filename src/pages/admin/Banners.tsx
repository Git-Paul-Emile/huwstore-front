import { Card, PageHead, Pill, Btn, useUI } from "../../components/admin/ui";
import { useBanners, useUpdateBanner } from "../../hooks/useBanners";
import { Plus, Image } from "../../components/icons";

export default function Banners() {
  const { toast } = useUI();
  const { data: banners = [] } = useBanners();
  const updateBanner = useUpdateBanner();

  const toggle = (id: string, active: boolean) => {
    updateBanner.mutate({ id, input: { active: !active } }, { onSuccess: () => toast("Statut de la bannière mis à jour") });
  };

  return (
    <div>
      <PageHead
        title="Bannières & campagnes"
        sub="Hero, bandeaux promo et pop-ups"
        action={<Btn onClick={() => toast("Nouvelle bannière (démo)")}><Plus /> Nouvelle bannière</Btn>}
      />

      <div className="space-y-3">
        {banners.map((b) => (
          <Card key={b.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <img src={b.image} alt={b.title} className="h-24 w-full rounded-lg object-cover sm:w-40" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="serif text-lg" style={{ color: "var(--adm-text)" }}>{b.title}</h3>
                <Pill tone="gold">{b.slot}</Pill>
                <Pill tone="blue">{b.target}</Pill>
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--adm-muted)" }}>Du {new Date(b.start).toLocaleDateString("fr-FR")} au {new Date(b.end).toLocaleDateString("fr-FR")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(b.id, b.active)}
                className={`relative h-6 w-11 rounded-full transition-colors ${b.active ? "bg-emerald-500" : ""}`}
                style={b.active ? undefined : { background: "var(--adm-border)" }}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${b.active ? "left-[22px]" : "left-0.5"}`} />
              </button>
              <Btn variant="ghost" onClick={() => toast("Édition bannière (démo)")}><Image /> Éditer</Btn>
            </div>
          </Card>
        ))}
        {banners.length === 0 && <Card className="p-10 text-center text-sm"><span style={{ color: "var(--adm-muted)" }}>Aucune bannière.</span></Card>}
      </div>
    </div>
  );
}
