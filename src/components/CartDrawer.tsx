import { useState } from "react";
import { useCartStore, useCartTotals } from "../store/useCartStore";
import { useDeliveryZones } from "../hooks/useDeliveryZones";
import { fcfa, SHOP_PHONE_WA } from "../data";
import { Close, Plus, Minus, Truck, ArrowRight, WhatsApp } from "./icons";

export default function CartDrawer() {
  const cartOpen = useCartStore((s) => s.cartOpen);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const cart = useCartStore((s) => s.cart);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const zone = useCartStore((s) => s.zone);
  const setZone = useCartStore((s) => s.setZone);
  const delivery = useCartStore((s) => s.delivery);
  const setDelivery = useCartStore((s) => s.setDelivery);
  const { subtotal, count, shipping } = useCartTotals();
  const { data: zones = [] } = useDeliveryZones();

  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);

  if (!cartOpen) return null;

  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const freeGap = zone ? Math.max(0, zone.freeFrom - subtotal) : 0;
  const progress = zone ? Math.min(100, (subtotal / zone.freeFrom) * 100) : 0;
  const total = subtotal - discount + shipping;

  const orderLines = cart.map((l) => `• ${l.product.name} (${l.variant.color}) x${l.qty} - ${fcfa(l.product.price * l.qty)}`).join("%0A");
  const waMessage = `Bonjour HUWSTORE, je souhaite commander :%0A${orderLines}%0A%0ALivraison : ${delivery === "relay" ? "Point relais / boutique" : "Domicile"}${zone ? ` - ${zone.city} (${zone.country})` : ""}%0ATotal : ${fcfa(total)}`;
  const waHref = `https://wa.me/${SHOP_PHONE_WA}?text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]" onClick={() => setCartOpen(false)} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream animate-slide-in">
        <div className="flex items-center justify-between border-b border-taupe/25 px-6 py-5">
          <h2 className="serif text-xl">Panier <span className="text-taupe text-base">({count})</span></h2>
          <button onClick={() => setCartOpen(false)} className="text-2xl transition-colors hover:text-gold-deep"><Close /></button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="serif text-2xl text-anthracite">Votre panier est vide</p>
            <p className="text-sm text-taupe">Découvrez nos pièces façonnées à la main.</p>
            <button onClick={() => setCartOpen(false)} className="label-lux mt-2 bg-ink px-6 py-3 text-cream transition-colors hover:bg-anthracite">
              Continuer mes achats
            </button>
          </div>
        ) : (
          <>
            {zone && (
              <div className="border-b border-taupe/20 px-6 py-4">
                <p className="text-xs text-anthracite">
                  {freeGap > 0 ? <>Plus que <span className="text-gold-deep font-medium">{fcfa(freeGap)}</span> pour la livraison offerte</> : "🎉 Livraison offerte débloquée"}
                </p>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-taupe/25">
                  <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="no-scrollbar flex-1 overflow-y-auto px-6">
              {cart.map((l) => (
                <div key={l.variant.id} className="flex gap-4 border-b border-taupe/15 py-5">
                  <div className="h-24 w-20 shrink-0 overflow-hidden bg-cream-tint">
                    <img src={l.variant.images[0]?.url ?? l.product.image} alt={l.variant.images[0]?.alt ?? l.product.imageAlt} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="label-lux text-taupe text-[0.58rem]">{l.product.collection}</p>
                        <p className="serif text-base leading-tight">{l.product.name}</p>
                        <p className="text-xs text-taupe mt-0.5">{l.variant.color} · {l.product.material}</p>
                      </div>
                      <button onClick={() => remove(l.variant.id)} className="text-taupe text-lg self-start transition-colors hover:text-bordeaux"><Close /></button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center border border-taupe/40">
                        <button onClick={() => setQty(l.variant.id, l.qty - 1)} className="grid h-8 w-8 place-items-center text-sm transition-colors hover:text-gold-deep"><Minus /></button>
                        <span className="w-8 text-center text-sm tabular-nums">{l.qty}</span>
                        <button onClick={() => setQty(l.variant.id, l.qty + 1)} className="grid h-8 w-8 place-items-center text-sm transition-colors hover:text-gold-deep"><Plus /></button>
                      </div>
                      <span className="text-sm tracking-wide">{fcfa(l.product.price * l.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-taupe/25 px-6 py-5">
              {/* Zone de livraison */}
              {zone && (
                <>
                  <p className="label-lux text-anthracite">Livraison vers</p>
                  <div className="relative mt-2">
                    <select
                      value={`${zone.city}|${zone.country}`}
                      onChange={(e) => {
                        const z = zones.find((z) => `${z.city}|${z.country}` === e.target.value);
                        if (z) { setZone(z); if (!z.relay && delivery === "relay") setDelivery("home"); }
                      }}
                      className="w-full appearance-none border border-taupe/40 bg-transparent py-2.5 pl-3 pr-9 text-sm text-ink outline-none focus:border-gold"
                    >
                      {zones.map((z) => (
                        <option key={`${z.city}|${z.country}`} value={`${z.city}|${z.country}`}>
                          {z.city} - {z.country}
                        </option>
                      ))}
                    </select>
                    <ArrowRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-taupe" />
                  </div>
                  <p className="mt-1.5 text-xs text-taupe">Délai estimé : <span className="text-anthracite">{zone.delay}</span> · Frais : {zone.fee === 0 ? "offerts" : fcfa(zone.fee)}</p>
                </>
              )}

              {/* Mode de livraison */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDelivery("home")}
                  className={`border px-3 py-2.5 text-left text-xs transition-colors ${delivery === "home" ? "border-gold bg-cream-tint" : "border-taupe/40 hover:border-gold"}`}
                >
                  <span className="block font-medium text-ink">Livraison à domicile</span>
                  <span className="text-taupe">{zone?.fee === 0 ? "Offerte" : zone ? fcfa(zone.fee) : "-"}</span>
                </button>
                <button
                  onClick={() => zone?.relay && setDelivery("relay")}
                  disabled={!zone?.relay}
                  className={`border px-3 py-2.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${delivery === "relay" ? "border-gold bg-cream-tint" : "border-taupe/40 hover:border-gold"}`}
                >
                  <span className="block font-medium text-ink">Retrait relais / boutique</span>
                  <span className="text-taupe">{zone?.relay ? "Gratuit" : "Indisponible ici"}</span>
                </button>
              </div>

              {/* Code promo */}
              <div className="mt-4 flex gap-2">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  placeholder="Code promo"
                  className="flex-1 border border-taupe/40 bg-transparent px-3 py-2.5 text-xs uppercase tracking-widest outline-none placeholder:text-taupe focus:border-gold"
                />
                <button
                  onClick={() => setApplied(promo.trim().toUpperCase() === "BIENVENUE10")}
                  className="label-lux border border-ink px-4 text-ink transition-colors hover:bg-ink hover:text-cream"
                >
                  Appliquer
                </button>
              </div>
              {applied && <p className="mt-2 text-xs text-bottle">Code BIENVENUE10 appliqué - 10% de réduction</p>}
              {promo && !applied && <p className="mt-2 text-xs text-bordeaux">Essayez le code BIENVENUE10</p>}

              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-anthracite"><dt>Sous-total</dt><dd>{fcfa(subtotal)}</dd></div>
                {discount > 0 && <div className="flex justify-between text-bottle"><dt>Réduction</dt><dd>−{fcfa(discount)}</dd></div>}
                <div className="flex justify-between text-anthracite">
                  <dt>{delivery === "relay" ? "Retrait relais" : "Livraison"}{zone ? ` · ${zone.city}` : ""}</dt>
                  <dd>{shipping === 0 ? "Offerte" : fcfa(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-taupe/25 pt-2 serif text-lg"><dt>Total</dt><dd>{fcfa(total)}</dd></div>
              </dl>

              <button className="group mt-4 flex w-full items-center justify-center gap-2 bg-ink py-4 text-cream transition-colors hover:bg-anthracite active:scale-[0.99]">
                <span className="label-lux">Passer au paiement</span>
                <ArrowRight className="text-base transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-2 border border-[#25D366] bg-[#25D366]/10 py-3.5 text-[#128C4B] transition-colors hover:bg-[#25D366]/20"
              >
                <WhatsApp className="text-lg" />
                <span className="label-lux">Commander via WhatsApp</span>
              </a>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-taupe">
                <Truck className="text-sm" /> Paiement à la livraison · Wave · Orange Money
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
