import { useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useToastStore } from "../store/useToastStore";
import { useMyOrders } from "../hooks/useOrders";
import { useProducts } from "../hooks/useProducts";
import { fcfa, SHOP_PHONE_WA } from "../data";
import type { Order, OrderStatus } from "../api/orders";
import { ProductCard } from "../components/Shared";
import {
  Grid, Bag, User, MapPin, Card as CardIcon, Heart, Star, Chat,
  ArrowRight, Check, Truck, LogOut, Plus, Lock,
} from "../components/icons";

type Tab = "overview" | "orders" | "profile" | "addresses" | "payment" | "wishlist" | "reviews" | "support";

const tabs: { key: Tab; label: string; icon: (p: { className?: string }) => ReactElement }[] = [
  { key: "overview", label: "Vue d'ensemble", icon: Grid },
  { key: "orders", label: "Mes commandes", icon: Bag },
  { key: "profile", label: "Mes informations", icon: User },
  { key: "addresses", label: "Mes adresses", icon: MapPin },
  { key: "payment", label: "Moyens de paiement", icon: CardIcon },
  { key: "wishlist", label: "Mes favoris", icon: Heart },
  { key: "reviews", label: "Mes avis", icon: Star },
  { key: "support", label: "Support", icon: Chat },
];

const statusTone: Record<OrderStatus, string> = {
  "En préparation": "bg-gold/20 text-gold-deep",
  "Expédiée": "bg-bottle/15 text-bottle",
  "En cours de livraison": "bg-bottle/15 text-bottle",
  "Livrée": "bg-bottle text-cream",
  "Retournée": "bg-bordeaux/15 text-bordeaux",
};

export default function Account() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="serif text-2xl">Connectez-vous pour accéder à votre compte</p>
        <button onClick={() => navigate("/")} className="label-lux mt-6 bg-ink px-6 py-3 text-cream">Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1300px] px-5 md:px-10 py-8 md:py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="label-lux text-gold-deep">Mon compte</p>
          <h1 className="serif mt-1 text-2xl md:text-3xl">Bonjour, {user.name.split(" ")[0]}</h1>
        </div>
        <button onClick={logout} className="hidden items-center gap-2 text-sm text-taupe hover:text-bordeaux sm:flex">
          <LogOut /> Déconnexion
        </button>
      </div>

      {/* Onglets mobiles scrollables */}
      <div className="no-scrollbar -mx-5 mb-6 flex gap-2 overflow-x-auto px-5 lg:hidden">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`label-lux whitespace-nowrap border px-4 py-2.5 text-[0.6rem] transition-colors ${tab === t.key ? "border-ink bg-ink text-cream" : "border-taupe/40 text-anthracite"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <nav className="space-y-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const on = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${on ? "bg-cream-tint text-ink" : "text-anthracite hover:text-gold-deep"}`}
                >
                  <span className="text-lg text-gold-deep"><Icon /></span> {t.label}
                </button>
              );
            })}
            <button onClick={logout} className="mt-2 flex w-full items-center gap-3 px-4 py-3 text-sm text-taupe hover:text-bordeaux">
              <LogOut /> Déconnexion
            </button>
          </nav>
        </aside>

        <div>
          {tab === "overview" && <Overview onGo={setTab} />}
          {tab === "orders" && <Orders />}
          {tab === "profile" && <Profile />}
          {tab === "addresses" && <Addresses />}
          {tab === "payment" && <Payment />}
          {tab === "wishlist" && <Wishlist />}
          {tab === "reviews" && <Reviews />}
          {tab === "support" && <Support />}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="serif text-xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Overview({ onGo }: { onGo: (t: Tab) => void }) {
  const user = useAuthStore((s) => s.user);
  const wishlist = useCartStore((s) => s.wishlist);
  const { data: orders = [] } = useMyOrders();
  const last = orders[0];

  return (
    <div className="space-y-6">
      {/* Fidélité */}
      <div className="flex flex-col gap-4 rounded-2xl bg-ink p-6 text-cream sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-lux text-gold">Cercle Maïa · Palier Or</p>
          <p className="serif mt-2 text-2xl">1 240 points</p>
          <p className="mt-1 text-xs text-cream/60">Plus que 260 points avant le palier VIP</p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-cream/15 sm:w-48">
          <div className="h-full rounded-full bg-gold" style={{ width: "82%" }} />
        </div>
      </div>

      {/* Dernière commande */}
      {last && (
        <div className="rounded-2xl border border-taupe/25 p-6">
          <div className="flex items-center justify-between">
            <p className="label-lux text-taupe">Dernière commande</p>
            <span className={`rounded-full px-3 py-1 text-xs ${statusTone[last.status]}`}>{last.status}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="serif text-lg">{last.id}</p>
              <p className="text-sm text-taupe">{new Date(last.date).toLocaleDateString("fr-FR")} · {fcfa(last.total)}</p>
            </div>
            <button onClick={() => onGo("orders")} className="label-lux flex items-center gap-2 text-gold-deep hover:underline">
              Suivre <ArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Raccourcis */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { t: "Mes commandes", i: Bag, k: "orders" as Tab },
          { t: "Mes favoris", i: Heart, k: "wishlist" as Tab },
          { t: "Mon profil", i: User, k: "profile" as Tab },
        ].map((s) => (
          <button key={s.t} onClick={() => onGo(s.k)} className="flex flex-col items-center gap-2 rounded-xl border border-taupe/25 py-6 transition-colors hover:border-gold">
            <span className="text-2xl text-gold-deep"><s.i /></span>
            <span className="text-xs text-anthracite">{s.t}{s.k === "wishlist" && wishlist.length > 0 ? ` (${wishlist.length})` : ""}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-taupe">Connectée en tant que {user?.phone}</p>
    </div>
  );
}

function Orders() {
  const toast = useToastStore((s) => s.toast);
  const { data: orders = [] } = useMyOrders();
  const [open, setOpen] = useState<Order | null>(null);
  const flow: OrderStatus[] = ["En préparation", "Expédiée", "Livrée"];

  return (
    <Panel title="Mes commandes">
      <div className="space-y-3">
        {orders.length === 0 && <p className="text-sm text-taupe">Vous n'avez pas encore de commande.</p>}
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-taupe/25 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="serif text-lg">{o.id}</p>
                <p className="text-sm text-taupe">{new Date(o.date).toLocaleDateString("fr-FR")} · {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">{fcfa(o.total)}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${statusTone[o.status]}`}>{o.status}</span>
                <button onClick={() => setOpen(open?.id === o.id ? null : o)} className="label-lux text-gold-deep hover:underline">Détail</button>
              </div>
            </div>

            {open?.id === o.id && (
              <div className="mt-4 border-t border-taupe/20 pt-4">
                {o.status !== "Retournée" && (
                  <div className="mb-5 flex items-center">
                    {flow.map((s, i) => {
                      const done = flow.indexOf(o.status) >= i;
                      return (
                        <div key={s} className="flex flex-1 items-center">
                          {i > 0 && <span className={`h-px flex-1 ${flow.indexOf(o.status) >= i ? "bg-gold" : "bg-taupe/30"}`} />}
                          <div className="flex flex-col items-center">
                            <span className={`grid h-7 w-7 place-items-center rounded-full text-xs ${done ? "bg-gold text-ink" : "bg-taupe-soft text-taupe"}`}>{done ? <Check /> : i + 1}</span>
                            <span className="mt-1 text-[0.6rem] text-taupe">{s}</span>
                          </div>
                          {i < flow.length - 1 && <span className={`h-px flex-1 ${flow.indexOf(o.status) > i ? "bg-gold" : "bg-taupe/30"}`} />}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {o.status === "Expédiée" && <Btn onClick={() => toast("Ouverture du suivi…")}><Truck /> Suivre ma livraison</Btn>}
                  <Btn ghost onClick={() => toast("Articles ajoutés au panier")}>Recommander</Btn>
                  {o.status === "Livrée" && <Btn ghost onClick={() => toast("Demande de retour envoyée")}>Retour / échange</Btn>}
                  <a href={`https://wa.me/${SHOP_PHONE_WA}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[#25D366] px-4 py-2.5 text-sm text-[#128C4B] transition-colors hover:bg-[#25D366]/10">
                    <Chat /> Support WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Profile() {
  const user = useAuthStore((s) => s.user);
  const toast = useToastStore((s) => s.toast);
  const [prefs, setPrefs] = useState({ WhatsApp: true, SMS: true, Email: false });
  return (
    <Panel title="Mes informations">
      <div className="grid gap-4 sm:grid-cols-2">
        <LabeledInput label="Nom complet" defaultValue={user?.name} />
        <LabeledInput label="Téléphone" defaultValue={user?.phone} hint="Modification confirmée par OTP" />
        <LabeledInput label="E-mail" defaultValue={user?.email ?? ""} placeholder="vous@email.com" />
        <LabeledInput label="Mot de passe" type="password" defaultValue="000000" />
      </div>
      <p className="label-lux mt-8 text-taupe">Préférences de notification</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(Object.keys(prefs) as (keyof typeof prefs)[]).map((k) => (
          <button
            key={k}
            onClick={() => setPrefs((p) => ({ ...p, [k]: !p[k] }))}
            className={`border px-4 py-2.5 text-sm transition-colors ${prefs[k] ? "border-gold bg-cream-tint text-ink" : "border-taupe/40 text-taupe"}`}
          >
            {prefs[k] ? "✓ " : ""}{k}
          </button>
        ))}
      </div>
      <button onClick={() => toast("Informations enregistrées")} className="label-lux mt-8 bg-ink px-8 py-3.5 text-cream transition-colors hover:bg-anthracite">Enregistrer</button>
    </Panel>
  );
}

function Addresses() {
  const toast = useToastStore((s) => s.toast);
  const [list, setList] = useState([
    { id: 1, label: "Domicile", detail: "Sacré-Cœur 3, villa 4521 · en face de la pharmacie", city: "Dakar", def: true },
    { id: 2, label: "Bureau", detail: "Plateau, avenue Pasteur, imm. Kébé, 2e étage", city: "Dakar", def: false },
    { id: 3, label: "Point relais", detail: "Relais HUWSTORE · Marché Sandaga", city: "Dakar", def: false },
  ]);
  const setDefault = (id: number) => { setList((l) => l.map((a) => ({ ...a, def: a.id === id }))); toast("Adresse par défaut mise à jour"); };
  return (
    <Panel title="Mes adresses" action={<Btn onClick={() => toast("Formulaire d'adresse (démo)")}><Plus /> Ajouter</Btn>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((a) => (
          <div key={a.id} className={`rounded-xl border p-4 ${a.def ? "border-gold" : "border-taupe/25"}`}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">{a.label}</p>
              {a.def && <span className="label-lux text-[0.55rem] text-gold-deep">Par défaut</span>}
            </div>
            <p className="mt-1.5 text-sm text-taupe">{a.detail}</p>
            <p className="mt-0.5 text-sm text-anthracite">{a.city}</p>
            <div className="mt-3 flex gap-3 text-xs">
              {!a.def && <button onClick={() => setDefault(a.id)} className="text-gold-deep hover:underline">Définir par défaut</button>}
              <button onClick={() => toast("Adresse modifiée")} className="text-anthracite hover:underline">Modifier</button>
              <button onClick={() => { setList((l) => l.filter((x) => x.id !== a.id)); toast("Adresse supprimée"); }} className="text-bordeaux hover:underline">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Payment() {
  const toast = useToastStore((s) => s.toast);
  const [list, setList] = useState([
    { id: 1, kind: "Wave", num: "•••• •• 90", color: "bg-[#1DC6FF]/15 text-[#0a7fa8]" },
    { id: 2, kind: "Orange Money", num: "•••• •• 44", color: "bg-[#FF7900]/15 text-[#b85700]" },
  ]);
  return (
    <Panel title="Mes moyens de paiement" action={<Btn onClick={() => toast("Ajout d'un moyen de paiement (démo)")}><Plus /> Ajouter</Btn>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl border border-taupe/25 p-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${m.color}`}>{m.kind}</span>
              <span className="text-sm tabular-nums text-anthracite">{m.num}</span>
            </div>
            <button onClick={() => { setList((l) => l.filter((x) => x.id !== m.id)); toast("Moyen de paiement supprimé"); }} className="text-xs text-bordeaux hover:underline">Supprimer</button>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-taupe"><Lock className="text-sm text-bottle" /> Numéros partiellement masqués pour votre sécurité.</p>
    </Panel>
  );
}

function Wishlist() {
  const wishlist = useCartStore((s) => s.wishlist);
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <Panel title={`Mes favoris (${items.length})`}>
      {items.length === 0 ? (
        <div className="rounded-xl border border-taupe/25 py-16 text-center">
          <p className="text-taupe">Aucun favori pour le moment.</p>
          <button onClick={() => navigate("/boutique")} className="label-lux mt-4 bg-ink px-6 py-3 text-cream">Découvrir la boutique</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </Panel>
  );
}

function Reviews() {
  const toast = useToastStore((s) => s.toast);
  const { data: products = [] } = useProducts();
  return (
    <Panel title="Mes avis">
      {products[2] && (
        <div className="rounded-xl border border-taupe/25 p-4">
          <p className="label-lux text-gold-deep">En attente d'avis</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={products[2].image} alt="" className="h-14 w-11 rounded object-cover" />
              <div><p className="font-medium">{products[2].name}</p><p className="text-xs text-taupe">Livrée récemment</p></div>
            </div>
            <Btn onClick={() => toast("Merci pour votre avis !")}>Laisser un avis</Btn>
          </div>
        </div>
      )}
      <div className="mt-3 rounded-xl border border-taupe/25 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex text-gold">{[1, 2, 3, 4, 5].map((i) => <Star key={i} filled />)}</span>
          <span className="text-sm font-medium">Besace Camille</span>
        </div>
        <p className="mt-2 text-sm text-anthracite">« Parfaite au quotidien, le cuir vieillit très bien. »</p>
        <p className="mt-1 text-xs text-taupe">Publié le 28 juillet</p>
      </div>
    </Panel>
  );
}

function Support() {
  return (
    <Panel title="Support & SAV">
      <div className="rounded-2xl bg-[#128C4B] p-6 text-cream">
        <p className="serif text-xl">Une question ? Écrivez-nous sur WhatsApp</p>
        <p className="mt-1 text-sm text-cream/80">Réponse en quelques minutes · du lundi au samedi.</p>
        <a href={`https://wa.me/${SHOP_PHONE_WA}`} target="_blank" rel="noopener noreferrer" className="label-lux mt-4 inline-flex items-center gap-2 bg-cream px-6 py-3 text-[#128C4B]">
          <Chat /> Contacter via WhatsApp
        </a>
      </div>
      <p className="label-lux mt-8 text-taupe">Questions fréquentes</p>
      <div className="mt-3 space-y-2">
        {[
          ["Quels sont les délais de livraison ?", "24–48 h à Dakar, 2–6 jours pour les autres villes selon la zone."],
          ["Puis-je payer à la livraison ?", "Oui, ainsi que par Wave et Orange Money."],
          ["Comment retourner un article ?", "Sous 14 jours, depuis Mes commandes → Retour / échange."],
        ].map(([q, a]) => <Faq key={q} q={q} a={a} />)}
      </div>
      <p className="label-lux mt-8 text-taupe">Historique des échanges</p>
      <div className="mt-3 rounded-xl border border-taupe/25 p-4 text-sm">
        <div className="flex justify-between"><span className="font-medium">Ticket #4821 - Suivi livraison</span><span className="text-bottle">Résolu</span></div>
        <p className="mt-1 text-taupe">Ouvert le 20 août · dernière réponse il y a 2 jours</p>
      </div>
    </Panel>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-taupe/20">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-3 text-left text-sm text-ink">
        {q}<span className="text-gold-deep">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="pb-3 text-sm text-taupe">{a}</p>}
    </div>
  );
}

// - petits helpers -
function Btn({ children, onClick, ghost }: { children: React.ReactNode; onClick?: () => void; ghost?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${ghost ? "border border-taupe/40 text-anthracite hover:border-gold" : "bg-ink text-cream hover:bg-anthracite"}`}
    >
      {children}
    </button>
  );
}

function LabeledInput({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label-lux text-[0.6rem] text-taupe">{label}</span>
      <input {...props} className="mt-2 w-full border border-taupe/45 bg-cream px-4 py-3 text-sm outline-none focus:border-gold" />
      {hint && <span className="mt-1 block text-[0.65rem] text-taupe">{hint}</span>}
    </label>
  );
}
