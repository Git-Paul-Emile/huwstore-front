import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useDeliveryZones } from "../hooks/useDeliveryZones";
import { useAddresses } from "../hooks/useAddresses";
import { useCreateOrder } from "../hooks/useOrders";
import { validatePromo, type PromoQuote } from "../api/promos";
import { PAY_METHOD_COD, type DeliveryMode } from "../api/orders";
import { fcfa } from "../data";
import { readApiError } from "../api/axiosConfig";
import { ArrowRight, Check, Truck, MapPin, Phone } from "../components/icons";
import { useSeo } from "../hooks/useSeo";

type Form = {
  client: string;
  phone: string;
  email: string;
  addressLine: string;
  landmark: string;
  note: string;
};

const EMPTY_FORM: Form = { client: "", phone: "", email: "", addressLine: "", landmark: "", note: "" };

export default function Checkout() {
  const navigate = useNavigate();
  const toast = useToastStore((s) => s.toast);
  useSeo({ title: "Finaliser ma commande", noindex: true });


  const cart = useCartStore((s) => s.cart);
  const clear = useCartStore((s) => s.clear);
  const zone = useCartStore((s) => s.zone);
  const setZone = useCartStore((s) => s.setZone);
  const delivery = useCartStore((s) => s.delivery);
  const setDelivery = useCartStore((s) => s.setDelivery);

  const user = useAuthStore((s) => s.user);

  const { data: zones = [] } = useDeliveryZones();
  const { data: addresses = [] } = useAddresses();
  const createOrder = useCreateOrder();

  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoQuote | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryMode: DeliveryMode = delivery === "relay" ? "Point relais" : "Domicile";
  const items = useMemo(() => cart.map((line) => ({ variantId: line.variant.id, qty: line.qty })), [cart]);

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.product.price, 0);
  const shipping = !zone || deliveryMode === "Point relais" || subtotal >= zone.freeFrom ? 0 : zone.fee;
  const discount = promo?.discount ?? 0;
  const total = subtotal + shipping - discount;

  // Le panier connu du serveur change : une remise calculée sur l'ancien
  // contenu n'a plus de sens, on la remet à zéro plutôt que d'afficher un
  // montant que la validation refusera.
  useEffect(() => {
    setPromo(null);
    setPromoError(null);
  }, [items, zone?.id, deliveryMode]);

  // Pré-remplissage : le compte, puis l'adresse par défaut du carnet.
  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      client: current.client || user.name,
      phone: current.phone || user.phone,
      email: current.email || (user.email ?? ""),
    }));
  }, [user]);

  useEffect(() => {
    if (addressId !== null || addresses.length === 0) return;
    const preferred = addresses.find((a) => a.isDefault) ?? addresses[0];
    applyAddress(preferred.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  function applyAddress(id: string) {
    const address = addresses.find((a) => a.id === id);
    if (!address) return;
    setAddressId(id);
    setForm((current) => ({
      ...current,
      client: address.fullName,
      phone: address.phone,
      addressLine: address.line,
      landmark: address.landmark ?? "",
    }));
    const matching = zones.find((z) => z.city.toLowerCase() === address.city.toLowerCase());
    if (matching) setZone(matching);
  }

  async function applyPromo() {
    const code = promoInput.trim();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const quote = await validatePromo({ code, items, deliveryZoneId: zone?.id, deliveryMode });
      setPromo(quote);
      toast(`Code ${quote.code} appliqué`);
    } catch (err) {
      setPromo(null);
      setPromoError(readApiError(err, "Ce code n'a pas pu être appliqué."));
    } finally {
      setPromoLoading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!zone) return setError("Choisissez votre zone de livraison.");
    if (cart.length === 0) return setError("Votre panier est vide.");

    try {
      const order = await createOrder.mutateAsync({
        client: form.client.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        addressLine: form.addressLine.trim(),
        landmark: form.landmark.trim() || undefined,
        city: zone.city,
        country: zone.country,
        deliveryMode,
        deliveryZoneId: zone.id,
        method: PAY_METHOD_COD,
        promoCode: promo?.code ?? undefined,
        note: form.note.trim() || undefined,
        items,
      });
      clear();
      navigate(`/commande/${order.id}`, { replace: true });
    } catch (err) {
      setError(readApiError(err, "La commande n'a pas pu être enregistrée."));
    }
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center md:px-10">
        <h1 className="serif text-2xl md:text-3xl">Votre panier est vide</h1>
        <p className="mt-3 text-sm text-taupe">Ajoutez une pièce à votre panier pour passer commande.</p>
        <Link to="/boutique" className="label-lux mt-8 inline-block bg-ink px-8 py-4 text-cream hover:bg-anthracite">
          Découvrir la boutique
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-16">
      <header className="mb-8 md:mb-12">
        <p className="label-lux text-taupe">Étape finale</p>
        <h1 className="serif mt-2 text-2xl md:text-4xl">Finaliser ma commande</h1>
      </header>

      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        <div className="flex flex-col gap-10">
          {addresses.length > 0 && (
            <fieldset className="flex flex-col gap-3">
              <legend className="serif mb-2 text-lg">Mes adresses enregistrées</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => applyAddress(address.id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      addressId === address.id ? "border-gold bg-cream-tint" : "border-taupe/30 hover:border-taupe"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">{address.label}</span>
                      {addressId === address.id && <Check className="text-gold-deep" />}
                    </span>
                    <span className="mt-1 block text-xs text-taupe">{address.line}</span>
                    <span className="mt-0.5 block text-xs text-anthracite">{address.city}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset className="flex flex-col gap-4">
            <legend className="serif mb-2 text-lg">Vos coordonnées</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet" required value={form.client} onChange={(v) => setForm({ ...form, client: v })} />
              <Field
                label="Téléphone"
                required
                type="tel"
                hint="C'est par ce numéro que la livreuse vous joindra."
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
              />
            </div>
            <Field
              label="E-mail (facultatif)"
              type="email"
              hint="Pour recevoir la confirmation et la facture."
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="serif mb-2 text-lg">Livraison</legend>

            <div className="grid gap-3 sm:grid-cols-2">
              <ModeCard
                active={delivery === "home"}
                onClick={() => setDelivery("home")}
                icon={<Truck className="text-lg text-gold-deep" />}
                title="Livraison à domicile"
                text={zone ? `${zone.delay} - ${zone.fee === 0 ? "offerte" : fcfa(zone.fee)}` : "Choisissez une zone"}
              />
              <ModeCard
                active={delivery === "relay"}
                onClick={() => setDelivery("relay")}
                icon={<MapPin className="text-lg text-gold-deep" />}
                title="Retrait en point relais"
                text="Sans frais"
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="label-lux text-taupe">Zone de livraison</span>
              <select
                required
                value={zone?.id ?? ""}
                onChange={(e) => {
                  const selected = zones.find((z) => z.id === e.target.value);
                  if (selected) setZone(selected);
                }}
                className="border border-taupe/40 bg-cream px-4 py-3.5 text-sm outline-none focus:border-gold"
              >
                <option value="" disabled>
                  Sélectionnez votre ville
                </option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.city} ({z.country}) - {z.fee === 0 ? "livraison offerte" : fcfa(z.fee)} - {z.delay}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Adresse"
              required
              placeholder="Quartier, rue, numéro de villa"
              value={form.addressLine}
              onChange={(v) => setForm({ ...form, addressLine: v })}
            />
            <Field
              label="Repère (facultatif)"
              placeholder="En face de la pharmacie, portail bleu…"
              hint="Un repère fait gagner un appel téléphonique à la livraison."
              value={form.landmark}
              onChange={(v) => setForm({ ...form, landmark: v })}
            />
            <Field
              label="Note pour la boutique (facultatif)"
              placeholder="Emballage cadeau, créneau souhaité…"
              value={form.note}
              onChange={(v) => setForm({ ...form, note: v })}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="serif mb-2 text-lg">Paiement</legend>
            <div className="flex items-start gap-3 border border-gold/60 bg-cream-tint p-4">
              <Phone className="mt-0.5 text-lg text-gold-deep" />
              <div>
                <p className="text-sm font-medium text-ink">Paiement à la livraison</p>
                <p className="mt-1 text-sm text-taupe">
                  Vous réglez en espèces au moment de la remise du colis. Aucun paiement en ligne ne vous sera demandé.
                </p>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-taupe/30 bg-cream-tint p-6">
            <h2 className="serif text-lg">Votre commande</h2>

            <ul className="mt-5 flex flex-col gap-3 border-b border-taupe/25 pb-5">
              {cart.map((line) => (
                <li key={line.variant.id} className="flex gap-3 text-sm">
                  <img
                    src={line.variant.images?.[0]?.url ?? line.product.image}
                    alt=""
                    className="h-16 w-14 shrink-0 object-cover"
                  />
                  <span className="flex-1">
                    <span className="block text-anthracite">{line.product.name}</span>
                    <span className="block text-xs text-taupe">
                      {line.variant.color} - ×{line.qty}
                    </span>
                  </span>
                  <span className="whitespace-nowrap text-anthracite">{fcfa(line.product.price * line.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Code promo"
                className="flex-1 border border-taupe/40 bg-cream px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoLoading || !promoInput.trim()}
                className="label-lux border border-ink px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-40"
              >
                {promoLoading ? "…" : "Appliquer"}
              </button>
            </div>
            {promoError && <p className="mt-2 text-xs text-bordeaux">{promoError}</p>}
            {promo?.label && <p className="mt-2 text-xs text-gold-deep">Code {promo.code} - {promo.label}</p>}

            <dl className="mt-5 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-anthracite">
                <dt>Sous-total</dt>
                <dd>{fcfa(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-anthracite">
                <dt>Livraison</dt>
                <dd>{shipping === 0 ? "Offerte" : fcfa(shipping)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gold-deep">
                  <dt>Remise</dt>
                  <dd>−{fcfa(discount)}</dd>
                </div>
              )}
              <div className="serif flex justify-between border-t border-taupe/25 pt-3 text-lg">
                <dt>Total à régler</dt>
                <dd>{fcfa(total)}</dd>
              </div>
            </dl>

            {error && <p className="mt-4 border-l-2 border-bordeaux pl-3 text-sm text-bordeaux">{error}</p>}

            <button
              type="submit"
              disabled={createOrder.isPending}
              className="group mt-5 flex w-full items-center justify-center gap-2 bg-ink py-4 text-cream transition-colors hover:bg-anthracite disabled:opacity-50"
            >
              <span className="label-lux">{createOrder.isPending ? "Enregistrement…" : "Confirmer ma commande"}</span>
              <ArrowRight className="text-base transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-lux text-taupe">
        {label} {required && <span aria-hidden className="text-bordeaux">*</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border border-taupe/40 bg-cream px-4 py-3.5 text-sm outline-none placeholder:text-taupe/70 focus:border-gold"
      />
      {hint && <span className="text-xs text-taupe">{hint}</span>}
    </label>
  );
}

function ModeCard({
  active,
  onClick,
  icon,
  title,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-start gap-3 border p-4 text-left transition-colors ${
        active ? "border-gold bg-cream-tint" : "border-taupe/30 hover:border-taupe"
      }`}
    >
      {icon}
      <span>
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-taupe">{text}</span>
      </span>
    </button>
  );
}
