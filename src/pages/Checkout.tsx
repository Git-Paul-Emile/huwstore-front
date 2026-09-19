import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useToastStore } from "../store/useToastStore";
import { useDeliveryZones } from "../hooks/useDeliveryZones";
import { useAddresses } from "../hooks/useAddresses";
import { useCart } from "../hooks/useCart";
import { useCreateOrder } from "../hooks/useOrders";
import { useShop } from "../hooks/useSettings";
import { validatePromo, type PromoQuote } from "../api/promos";
import type { DeliveryMode, PayMethod } from "../api/orders";
import { fcfa } from "../data";
import { readApiError } from "../api/axiosConfig";
import { ArrowRight, Check, Truck, Alert } from "../components/icons";
import { useSeo } from "../hooks/useSeo";
import waveLogo from "../assets/wave.png";
import orangeMoneyLogo from "../assets/orange-money.png";

type Form = {
  client: string;
  phone: string;
  email: string;
  addressLine: string;
  landmark: string;
  note: string;
};

type FieldErrors = Partial<Record<"client" | "phone" | "email" | "addressLine", string>>;

const EMPTY_FORM: Form = { client: "", phone: "", email: "", addressLine: "", landmark: "", note: "" };

// La validation navigateur est coupée (noValidate). Ces règles reprennent celles
// du schéma serveur (back/src/validators/order.validator.ts et common.ts) pour
// afficher un message avant l'appel réseau. Le serveur reste la source de vérité
// et revalide chaque commande.
const SENEGAL_PHONE = /^(?:\+221|00221)?7[05678]\d{7}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(form: Form): FieldErrors {
  const errors: FieldErrors = {};
  if (form.client.trim().length < 2) errors.client = "Indiquez votre nom complet.";
  if (!SENEGAL_PHONE.test(form.phone.replace(/[\s.-]/g, "")))
    errors.phone = "Numéro de téléphone sénégalais attendu, ex. 77 123 45 67.";
  if (form.email.trim() && !EMAIL.test(form.email.trim())) errors.email = "Adresse e-mail invalide.";
  if (form.addressLine.trim().length < 5) errors.addressLine = "Indiquez votre adresse (quartier, rue, numéro).";
  return errors;
}

export default function Checkout() {
  const navigate = useNavigate();
  const toast = useToastStore((s) => s.toast);
  useSeo({ title: "Finaliser ma commande", noindex: true });


  const { cart, clear, isLoading: cartLoading } = useCart();
  const zone = useCartStore((s) => s.zone);
  const setZone = useCartStore((s) => s.setZone);

  const user = useAuthStore((s) => s.user);
  const shop = useShop();

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [method, setMethod] = useState<PayMethod | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // La boutique ne propose que la livraison à domicile.
  const deliveryMode: DeliveryMode = "Domicile";
  const items = useMemo(() => cart.map((line) => ({ variantId: line.variant.id, qty: line.qty })), [cart]);

  // On ne fait confiance qu'à une zone qui existe encore côté serveur : une zone
  // supprimée restée en mémoire locale ne doit ni chiffrer les frais ni partir
  // avec la commande.
  const activeZone = zone && zones.some((z) => z.id === zone.id) ? zone : null;

  /**
   * Espèces n'est proposé qu'à Dakar (vérifié aussi côté serveur). Wave n'est
   * proposé que si la boutique a renseigné son lien de paiement dans
   * Paramètres - inutile d'offrir un choix qui ne mène nulle part. Orange
   * Money reste affiché même sans lien encore configuré : la commande est
   * tout de même valide, la boutique contacte alors la cliente par téléphone
   * pour l'encaissement (voir `mail.service.ts`, `paymentHtml`).
   */
  const availableMethods = useMemo<PayMethod[]>(() => {
    const list: PayMethod[] = [];
    if (activeZone?.codEligible) list.push("Espèces");
    if (shop.wavePaymentUrl) list.push("Wave");
    list.push("Orange Money");
    return list;
  }, [activeZone, shop.wavePaymentUrl]);

  const isDakar = Boolean(activeZone?.codEligible);
  const mobileMoneyMethods: PayMethod[] = availableMethods.filter((m) => m !== "Espèces");

  /**
   * Sur Dakar, le paiement se règle à la livraison quel qu'il soit (espèces
   * ou mobile money entre les mains de la livreuse) : le bloc est purement
   * informatif, rien à choisir, la commande part en espèces par défaut.
   * Ailleurs, le mobile money est payé d'avance : rien n'est présélectionné,
   * la cliente doit choisir elle-même Wave ou Orange Money - `submit()`
   * refuse la commande tant qu'aucun moyen n'est choisi. On efface seulement
   * un choix devenu invalide, par exemple après un changement de zone.
   */
  useEffect(() => {
    if (isDakar) {
      if (method !== "Espèces") setMethod("Espèces");
      return;
    }
    if (method && !mobileMoneyMethods.includes(method)) setMethod(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDakar, mobileMoneyMethods]);

  const subtotal = cart.reduce((sum, line) => sum + line.qty * line.product.price, 0);
  const shipping = !activeZone || subtotal >= activeZone.freeFrom ? 0 : activeZone.fee;
  const discount = promo?.discount ?? 0;
  const total = subtotal + shipping - discount;

  // Le panier connu du serveur change : une remise calculée sur l'ancien
  // contenu n'a plus de sens, on la remet à zéro plutôt que d'afficher un
  // montant que la validation refusera.
  useEffect(() => {
    setPromo(null);
    setPromoError(null);
  }, [items, zone?.id]);

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
      const quote = await validatePromo({ code, items, deliveryZoneId: activeZone?.id, deliveryMode });
      setPromo(quote);
      toast(`Code ${quote.code} appliqué`);
    } catch (err) {
      setPromo(null);
      setPromoError(readApiError(err, "Ce code n'a pas pu être appliqué."));
    } finally {
      setPromoLoading(false);
    }
  }

  function update(key: keyof Form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as keyof FieldErrors];
      return next;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!activeZone) return setError("Choisissez votre zone de livraison.");
    if (cart.length === 0) return setError("Votre panier est vide.");
    if (!method) return setError("Choisissez un moyen de paiement.");

    const found = validateForm(form);
    setFieldErrors(found);
    if (Object.keys(found).length > 0) {
      // Sans validation navigateur, plus rien n'amène l'utilisateur au champ
      // fautif : on l'y conduit et on lui donne le focus une fois le message rendu.
      requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid?.focus({ preventScroll: true });
      });
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        client: form.client.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        addressLine: form.addressLine.trim(),
        landmark: form.landmark.trim() || undefined,
        city: activeZone.city,
        country: activeZone.country,
        deliveryMode,
        deliveryZoneId: activeZone.id,
        method,
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

  // Juste après la connexion, le panier pris avant de se connecter est en
  // train d'être versé dans le compte (`useCartSync`) : le panier serveur
  // paraît vide le temps de cette fusion. Sans cet état de chargement, cet
  // écran affichait « Votre panier est vide » à sa place, cachant tout le
  // formulaire - y compris le paiement - pendant plusieurs secondes.
  if (cartLoading) {
    return <p className="mx-auto max-w-2xl px-5 py-24 text-center text-sm text-taupe">Chargement de votre panier…</p>;
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

      {/* noValidate : la validation navigateur est coupée. Le contrôle se fait en
          JS dans submit() via validateForm(), puis côté serveur qui tranche. */}
      <form ref={formRef} onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
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
              <Field
                label="Nom complet"
                required
                value={form.client}
                onChange={(v) => update("client", v)}
                error={fieldErrors.client}
              />
              <Field
                label="Téléphone"
                required
                type="tel"
                hint="C'est par ce numéro que la livreuse vous joindra."
                value={form.phone}
                onChange={(v) => update("phone", v)}
                error={fieldErrors.phone}
              />
            </div>
            <Field
              label="E-mail (facultatif)"
              type="email"
              hint="Pour recevoir la confirmation et la facture."
              value={form.email}
              onChange={(v) => update("email", v)}
              error={fieldErrors.email}
            />
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="serif mb-2 text-lg">Livraison</legend>

            <div className="flex items-start gap-3 border border-taupe/30 bg-cream-tint p-4">
              <Truck className="mt-0.5 text-lg text-gold-deep" />
              <div>
                <p className="text-sm font-medium text-ink">Livraison à domicile</p>
                <p className="mt-1 text-sm text-taupe">
                  {activeZone
                    ? `${activeZone.delay} - ${activeZone.fee === 0 ? "livraison offerte" : fcfa(activeZone.fee)}`
                    : "Choisissez votre ville ci-dessous pour connaître le délai et les frais."}
                </p>
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="label-lux text-taupe">Zone de livraison</span>
              <select
                value={activeZone?.id ?? ""}
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
              onChange={(v) => update("addressLine", v)}
              error={fieldErrors.addressLine}
            />
            <Field
              label="Repère (facultatif)"
              placeholder="En face de la pharmacie, portail bleu…"
              hint="Un repère fait gagner un appel téléphonique à la livraison."
              value={form.landmark}
              onChange={(v) => update("landmark", v)}
            />
            <Field
              label="Note pour la boutique (facultatif)"
              placeholder="Emballage cadeau, créneau souhaité…"
              value={form.note}
              onChange={(v) => update("note", v)}
            />
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

            {/* Nos conditions générales disent que passer commande vaut
                acceptation : elles doivent donc être lisibles ICI, au moment
                où l'on commande, et pas seulement au fond du pied de page.
                Pas de case à cocher supplémentaire - une commande se passe
                aussi sans compte, et une case de plus entre le panier et la
                confirmation coûterait des ventes sans rien ajouter à ce que
                cette phrase établit déjà. */}
            <p className="mt-4 text-center text-xs leading-relaxed text-taupe">
              En confirmant, vous acceptez nos{" "}
              <Link to="/cgu" target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-2">
                conditions générales
              </Link>{" "}
              et notre{" "}
              <Link to="/confidentialite" target="_blank" rel="noopener noreferrer" className="text-gold-deep underline underline-offset-2">
                politique de confidentialité
              </Link>
              .
            </p>
          </div>

          <fieldset className="mt-4 border border-taupe/30 bg-cream-tint">
            <legend className="sr-only">Mode de paiement</legend>
            <p className="label-lux px-6 pt-5 text-taupe">Mode de paiement</p>

            {!activeZone ? (
              <p className="px-6 pb-5 pt-2 text-sm text-taupe">
                Choisissez votre zone de livraison pour connaître les modalités de paiement.
              </p>
            ) : availableMethods.length === 0 ? (
              <p className="px-6 pb-5 pt-2 text-sm text-bordeaux">
                Aucun moyen de paiement n'est disponible pour cette zone pour le moment. Contactez-nous au{" "}
                {shop.phone}.
              </p>
            ) : isDakar ? (
              // Sur Dakar, le paiement se règle à la livraison quel que soit
              // le moyen choisi (espèces ou mobile money entre les mains de
              // la livreuse) : rien à faire choisir ici, juste informer.
              <div className="flex flex-col gap-3 px-6 pb-5 pt-2">
                <div className="flex items-center gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream text-xl">💵</span>
                  <img src={waveLogo} alt="Wave" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  <img
                    src={orangeMoneyLogo}
                    alt="Orange Money"
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                </div>
                <p className="text-sm text-taupe">
                  Réglez à la livraison, en espèces ou par mobile money (Wave, Orange Money), directement auprès de
                  la livreuse.
                </p>
              </div>
            ) : (
              <div className="pb-5">
                {/* Hors zone éligible aux espèces, le mobile money est le
                    seul moyen ouvert et il est payé d'avance, hors du site :
                    le site ne peut jamais vérifier lui-même qu'un virement
                    est arrivé, la boutique confirme donc l'encaissement à la
                    main avant d'expédier. */}
                <p className="px-6 pb-3 pt-2 text-sm font-medium text-ink">
                  Paiement par Wave ou Orange Money pour valider la commande et la finaliser.
                </p>

                <div className="border-t border-taupe/15">
                  {mobileMoneyMethods.map((m) => (
                    <PaymentOption
                      key={m}
                      selected={method === m}
                      onSelect={() => setMethod(m)}
                      title={m}
                      description={`Payez avec ${m}, en ligne, pour valider votre commande.`}
                      icon={
                        <img
                          src={m === "Wave" ? waveLogo : orangeMoneyLogo}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </fieldset>
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
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-lux text-taupe">
        {label} {required && <span aria-hidden className="text-bordeaux">*</span>}
      </span>
      <input
        type={type}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`border bg-cream px-4 py-3.5 text-sm outline-none placeholder:text-taupe/70 focus:border-gold ${
          error ? "border-bordeaux bg-bordeaux/5 focus:border-bordeaux" : "border-taupe/40"
        }`}
      />
      {error ? (
        <span role="alert" className="flex items-center gap-1.5 text-xs font-medium text-bordeaux">
          <Alert className="shrink-0 text-sm" />
          {error}
        </span>
      ) : (
        hint && <span className="text-xs text-taupe">{hint}</span>
      )}
    </label>
  );
}

/** Une ligne de choix du bloc paiement : puce ronde, titre, description, logo. */
function PaymentOption({
  selected,
  onSelect,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex w-full items-center gap-3 border-b border-taupe/15 px-6 py-4 text-left transition-colors last:border-b-0 hover:bg-cream/60"
    >
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-gold-deep" : "border-taupe/40"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-gold-deep" />}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-taupe">{description}</span>
      </span>
      <span className="shrink-0">{icon}</span>
    </button>
  );
}

