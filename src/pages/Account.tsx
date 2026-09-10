import { useState, type FormEvent, type ReactElement } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import { useUpdateProfile } from "../hooks/useAuth";
import { downloadInvoice } from "../api/orders";
import { readApiError } from "../api/axiosConfig";
import { useToastStore } from "../store/useToastStore";
import { useMyOrders } from "../hooks/useOrders";
import { useProducts } from "../hooks/useProducts";
import { useWishlist } from "../hooks/useWishlist";
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../hooks/useAddresses";
import type { AddressInput } from "../api/addresses";
import { useSeo } from "../hooks/useSeo";
import { fcfa } from "../data";
import { useShop } from "../hooks/useSettings";
import type { Order, OrderStatus } from "../api/orders";
import { ProductCard } from "../components/Shared";
import {
  Grid, Bag, User, MapPin, Heart, Chat, Download,
  ArrowRight, Check, Truck, LogOut, Plus, Close,
} from "../components/icons";

type Tab = "overview" | "orders" | "profile" | "addresses" | "wishlist" | "support";

const tabs: { key: Tab; label: string; icon: (p: { className?: string }) => ReactElement }[] = [
  { key: "overview", label: "Vue d'ensemble", icon: Grid },
  { key: "orders", label: "Mes commandes", icon: Bag },
  { key: "profile", label: "Mes informations", icon: User },
  { key: "addresses", label: "Mes adresses", icon: MapPin },
  { key: "wishlist", label: "Mes favoris", icon: Heart },
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
  const [searchParams] = useSearchParams();
  // Le lien favoris de l'en-tête ouvre directement l'onglet (/compte?tab=wishlist).
  const requestedTab = searchParams.get("tab");
  const initialTab = tabs.some((t) => t.key === requestedTab) ? (requestedTab as Tab) : "overview";
  const [tab, setTab] = useState<Tab>(initialTab);
  useSeo({ title: "Mon compte", noindex: true });

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
      </div>

      {/* Onglets mobiles scrollables.

          La déconnexion ferme la liste, comme elle ferme la barre latérale sur
          grand écran : c'est le même endroit, la navigation, à la place que
          chaque taille d'écran lui donne. La retirer d'ici l'aurait rendue
          introuvable sur téléphone, où la barre latérale n'existe pas - et le
          téléphone est l'écran de presque toutes les clientes. */}
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
        <button
          onClick={logout}
          className="label-lux flex items-center gap-2 whitespace-nowrap border border-taupe/40 px-4 py-2.5 text-[0.6rem] text-taupe transition-colors hover:border-bordeaux hover:text-bordeaux"
        >
          <LogOut /> Déconnexion
        </button>
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
          {tab === "wishlist" && <Wishlist />}
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
  const { ids: wishlist } = useWishlist();
  const { data: orders = [] } = useMyOrders();
  const last = orders[0];
  const spent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-6">
      {/* Repères de compte. Chiffres réels : aucun programme de fidélité n'existe. */}
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-ink p-6 text-cream sm:grid-cols-3">
        <Stat label="Commandes" value={String(orders.length)} />
        <Stat label="Total commandé" value={fcfa(spent)} />
        <Stat label="Favoris" value={String(wishlist.length)} />
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
              <p className="text-sm text-taupe">{new Date(last.date).toLocaleDateString("fr-FR")} - {fcfa(last.total)}</p>
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
  const shop = useShop();
  const { data: orders = [] } = useMyOrders();
  const { data: products = [] } = useProducts();
  const addToCart = useCartStore((s) => s.addToCart);
  const [open, setOpen] = useState<Order | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const flow: OrderStatus[] = ["En préparation", "En cours de livraison", "Livrée"];

  /** Télécharge la facture PDF émise par le serveur pour cette commande. */
  async function getInvoice(orderId: string) {
    setBusy(orderId);
    try {
      const blob = await downloadInvoice(orderId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${orderId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast(readApiError(error, "La facture n'a pas pu être téléchargée."));
    } finally {
      setBusy(null);
    }
  }

  /**
   * Remet au panier les articles encore disponibles. Un modèle retiré du
   * catalogue ou une couleur épuisée est signalé plutôt qu'ajouté en silence.
   */
  function reorder(order: Order) {
    let added = 0;
    let missing = 0;

    for (const item of order.items) {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.variants?.find((v) => v.id === item.variantId);
      if (!product || !variant || !variant.available) {
        missing += 1;
        continue;
      }
      for (let i = 0; i < item.qty; i++) addToCart(product, variant);
      added += 1;
    }

    if (added === 0) toast("Ces articles ne sont plus disponibles.");
    else if (missing > 0) toast(`${added} article(s) ajouté(s) - ${missing} indisponible(s).`);
    else toast("Articles ajoutés au panier");
  }

  return (
    <Panel title="Mes commandes">
      <div className="space-y-3">
        {orders.length === 0 && <p className="text-sm text-taupe">Vous n'avez pas encore de commande.</p>}
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border border-taupe/25 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="serif text-lg">{o.id}</p>
                <p className="text-sm text-taupe">{new Date(o.date).toLocaleDateString("fr-FR")} - {o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</p>
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
                {o.tracking && (
                  <p className="mb-3 text-sm text-taupe">
                    <Truck className="mr-1.5 inline text-gold-deep" />
                    Suivi : <span className="text-anthracite">{o.tracking}</span>
                    {o.courier && <span className="text-taupe"> - {o.courier}</span>}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Btn onClick={() => getInvoice(o.id)}>
                    <Download /> {busy === o.id ? "Préparation…" : "Télécharger la facture"}
                  </Btn>
                  <Btn ghost onClick={() => reorder(o)}>Recommander</Btn>
                  {shop.whatsapp && (
                    <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-[#25D366] px-4 py-2.5 text-sm text-[#128C4B] transition-colors hover:bg-[#25D366]/10">
                      <Chat /> Support WhatsApp
                    </a>
                  )}
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
  const updateProfile = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    // On garde une référence au formulaire : `event.currentTarget` vaut null
    // une fois la requête revenue, React ayant déjà rendu à nouveau.
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");

    updateProfile.mutate(
      {
        name: String(data.get("name") ?? ""),
        // Une chaîne vide efface l'adresse enregistrée, `null` le dit à l'API.
        email: String(data.get("email") ?? "").trim() || null,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      },
      {
        onSuccess: () => {
          toast("Informations enregistrées");
          // Seuls les mots de passe sont vidés : le nom et l'e-mail restent
          // affichés tels qu'ils viennent d'être enregistrés.
          form.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((input) => {
            input.value = "";
          });
        },
        onError: (err) => setError(readApiError(err, "Les informations n'ont pas pu être enregistrées.")),
      },
    );
  }

  return (
    <Panel title="Mes informations">
      <form onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput label="Nom complet" name="name" defaultValue={user?.name} required />
          <LabeledInput
            label="Téléphone"
            defaultValue={user?.phone}
            hint="Identifiant de connexion : contactez-nous pour le modifier."
            disabled
          />
          <LabeledInput
            label="E-mail"
            name="email"
            type="email"
            defaultValue={user?.email ?? ""}
            placeholder="vous@email.com"
            hint="Sert à recevoir la confirmation de commande et la facture."
          />
        </div>

        <p className="label-lux mt-8 text-taupe">Changer de mot de passe</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <LabeledInput label="Mot de passe actuel" name="currentPassword" type="password" autoComplete="current-password" />
          <LabeledInput
            label="Nouveau mot de passe"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            hint="8 caractères minimum. Laissez vide pour ne pas le changer."
          />
        </div>

        {error && <p className="mt-4 text-sm text-bordeaux">{error}</p>}

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="label-lux mt-8 bg-ink px-8 py-3.5 text-cream transition-colors hover:bg-anthracite disabled:opacity-60"
        >
          {updateProfile.isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </Panel>
  );
}

function Addresses() {
  const toast = useToastStore((s) => s.toast);
  const { data: addresses = [], isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const setDefault = useSetDefaultAddress();
  const removeAddress = useDeleteAddress();
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const input: AddressInput = {
      label: String(data.get("label") ?? ""),
      fullName: String(data.get("fullName") ?? ""),
      phone: String(data.get("phone") ?? ""),
      line: String(data.get("line") ?? ""),
      landmark: String(data.get("landmark") ?? "") || undefined,
      city: String(data.get("city") ?? ""),
      country: "Sénégal",
      isDefault: addresses.length === 0,
    };

    try {
      await createAddress.mutateAsync(input);
      setFormOpen(false);
      toast("Adresse enregistrée");
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message ?? "L'adresse n'a pas pu être enregistrée.");
    }
  }

  return (
    <Panel
      title="Mes adresses"
      action={
        <Btn onClick={() => setFormOpen((open) => !open)}>
          {formOpen ? <Close /> : <Plus />} {formOpen ? "Annuler" : "Ajouter"}
        </Btn>
      }
    >
      {formOpen && (
        <form onSubmit={submit} className="mb-5 grid gap-3 rounded-xl border border-taupe/25 p-4 sm:grid-cols-2">
          <LabeledInput label="Nom de l'adresse" name="label" required placeholder="Domicile, Bureau…" />
          <LabeledInput label="Destinataire" name="fullName" required />
          <LabeledInput label="Téléphone" name="phone" required placeholder="77 123 45 67" />
          <LabeledInput label="Ville" name="city" required placeholder="Dakar" />
          <div className="sm:col-span-2">
            <LabeledInput label="Adresse" name="line" required placeholder="Quartier, rue, numéro de villa" />
          </div>
          <div className="sm:col-span-2">
            <LabeledInput
              label="Repère (facultatif)"
              name="landmark"
              hint="Un repère fait gagner un appel téléphonique à la livraison."
              placeholder="En face de la pharmacie, portail bleu…"
            />
          </div>
          {error && <p className="text-sm text-bordeaux sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createAddress.isPending}
              className="label-lux bg-ink px-6 py-3 text-cream transition-colors hover:bg-anthracite disabled:opacity-50"
            >
              {createAddress.isPending ? "Enregistrement…" : "Enregistrer l'adresse"}
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-taupe">Chargement…</p>}
      {!isLoading && addresses.length === 0 && !formOpen && (
        <p className="rounded-xl border border-taupe/25 py-12 text-center text-sm text-taupe">
          Aucune adresse enregistrée. Ajoutez-en une pour commander plus vite la prochaine fois.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className={`rounded-xl border p-4 ${address.isDefault ? "border-gold" : "border-taupe/25"}`}>
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">{address.label}</p>
              {address.isDefault && <span className="label-lux text-[0.55rem] text-gold-deep">Par défaut</span>}
            </div>
            <p className="mt-1.5 text-sm text-taupe">{address.line}</p>
            {address.landmark && <p className="text-sm italic text-taupe">{address.landmark}</p>}
            <p className="mt-0.5 text-sm text-anthracite">{address.city}</p>
            <p className="mt-0.5 text-xs text-taupe">{address.fullName} - {address.phone}</p>
            <div className="mt-3 flex gap-3 text-xs">
              {!address.isDefault && (
                <button
                  onClick={() => setDefault.mutate(address.id, { onSuccess: () => toast("Adresse par défaut mise à jour") })}
                  className="text-gold-deep hover:underline"
                >
                  Définir par défaut
                </button>
              )}
              <button
                onClick={() => removeAddress.mutate(address.id, { onSuccess: () => toast("Adresse supprimée") })}
                className="text-bordeaux hover:underline"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Wishlist() {
  const { ids } = useWishlist();
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const items = products.filter((p) => ids.includes(p.id));
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

function Support() {
  const shop = useShop();

  return (
    <Panel title="Support & SAV">
      <div className="rounded-2xl bg-[#128C4B] p-6 text-cream">
        <p className="serif text-xl">Une question ? Écrivez-nous sur WhatsApp</p>
        <p className="mt-1 text-sm text-cream/80">Réponse en quelques minutes - du lundi au samedi.</p>
        {shop.whatsapp && (
          <a href={`https://wa.me/${shop.whatsapp}`} target="_blank" rel="noopener noreferrer" className="label-lux mt-4 inline-flex items-center gap-2 bg-cream px-6 py-3 text-[#128C4B]">
            <Chat /> Contacter via WhatsApp
          </a>
        )}
      </div>
      <p className="label-lux mt-8 text-taupe">Questions fréquentes</p>
      <div className="mt-3 space-y-2">
        {[
          ["Quels sont les délais de livraison ?", "Moins de 24 h sur Dakar, sauf le dimanche. En région, sous 72 h ouvrées à partir de la confirmation du paiement."],
          ["Comment se passe le paiement ?", "Sur Dakar, en espèces à la remise du colis. En région, d'avance par Wave ou Orange Money hors du site, avec preuve par WhatsApp : c'est ce paiement qui confirme la commande. Aucun paiement ne se fait sur ce site."],
          [
            "Puis-je retourner un article ?",
            "Les retours et les échanges ne sont pas acceptés. Vérifiez votre article devant la personne qui vous le remet : un article endommagé ou non conforme est repris s'il est signalé immédiatement.",
          ],
        ].map(([q, a]) => <Faq key={q} q={q} a={a} />)}
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
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-lux text-gold">{label}</p>
      <p className="serif mt-1.5 text-xl">{value}</p>
    </div>
  );
}

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
