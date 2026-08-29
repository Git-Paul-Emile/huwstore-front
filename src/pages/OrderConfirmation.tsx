import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { downloadInvoice } from "../api/orders";
import { readApiError } from "../api/axiosConfig";
import { useOrder } from "../hooks/useOrders";
import { useShop } from "../hooks/useSettings";
import { useAuthStore } from "../store/useAuthStore";
import { fcfa } from "../data";
import { Check, Truck, Phone, Download } from "../components/icons";
import { useSeo } from "../hooks/useSeo";

/**
 * Confirmation de commande, qui sert aussi de reçu à l'écran.
 *
 * Deux façons légitimes d'arriver ici :
 *  - connectée, sur une commande de son propre compte ;
 *  - avec le jeton de lecture reçu à l'achat (`?token=…`), ce qui rend la
 *    commande SANS COMPTE consultable - c'est le lien rappelé dans l'e-mail
 *    de confirmation.
 *
 * La facture, elle, est un vrai PDF généré par le serveur : le bouton la
 * télécharge, il ne se contente pas d'ouvrir la fenêtre d'impression.
 */
export default function OrderConfirmation() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? undefined;

  const status = useAuthStore((s) => s.status);
  const shop = useShop();
  const { data: order, isLoading, isError } = useOrder(id, token);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Un reçu ne doit jamais finir dans un index de moteur de recherche.
  useSeo({ title: order ? `Reçu ${order.id}` : "Votre commande", noindex: true });

  async function getInvoice() {
    if (!order) return;
    setInvoiceError(null);
    setDownloading(true);
    try {
      const blob = await downloadInvoice(order.id, token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${order.id}.pdf`;
      link.click();
      // Libère la mémoire : sans cela, le fichier reste en mémoire tant que
      // l'onglet est ouvert.
      URL.revokeObjectURL(url);
    } catch (error) {
      setInvoiceError(readApiError(error, "La facture n'a pas pu être téléchargée."));
    } finally {
      setDownloading(false);
    }
  }

  if (isLoading || status === "loading") {
    return <p className="mx-auto max-w-2xl px-5 py-24 text-center text-sm text-taupe">Chargement de votre commande…</p>;
  }

  if (isError || !order) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center md:px-10">
        <h1 className="serif text-2xl md:text-3xl">Commande introuvable</h1>
        <p className="mt-3 text-sm text-taupe">
          Ce numéro n'existe pas, ou le lien utilisé n'est plus valable. Si vous avez commandé sans compte, ouvrez le
          lien reçu par e-mail{shop.phone ? `, ou appelez-nous au ${shop.phone}` : ""}.
        </p>
        <Link to="/boutique" className="label-lux mt-8 inline-block bg-ink px-8 py-4 text-cream hover:bg-anthracite">
          Retour à la boutique
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 md:px-10 md:py-20">
      <header className="text-center print:text-left">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-2xl text-gold-deep print:hidden">
          <Check />
        </span>
        <h1 className="serif mt-5 text-2xl md:text-3xl">Merci, votre commande est enregistrée</h1>
        <p className="mt-3 text-sm text-taupe">
          Commande <span className="text-anthracite">{order.id}</span> du{" "}
          {new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </header>

      {/* Commande sans compte : le lien de cette page est la seule clé d'accès. */}
      {token && (
        <p className="mt-6 border border-gold/40 bg-gold/10 px-5 py-4 text-sm text-anthracite print:hidden">
          Vous avez commandé sans compte. <strong>Conservez ce lien</strong> : il vous permet de revenir sur ce reçu et
          de retélécharger votre facture. Il vous a aussi été envoyé par e-mail.
        </p>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 print:grid-cols-2">
        <InfoCard icon={<Truck className="text-lg text-gold-deep" />} title="Livraison">
          <p className="font-medium text-ink">{order.client}</p>
          <p>{order.phone}</p>
          <p>{order.addressLine}</p>
          {order.landmark && <p className="italic">{order.landmark}</p>}
          <p>
            {order.city}, {order.country} - {order.deliveryMode}
          </p>
          {order.tracking && <p className="mt-1 text-anthracite">Suivi : {order.tracking}</p>}
        </InfoCard>

        <InfoCard icon={<Phone className="text-lg text-gold-deep" />} title="Paiement">
          <p className="font-medium text-ink">{order.method}</p>
          <p>
            Vous réglerez <span className="text-anthracite">{fcfa(order.total)}</span> en espèces à la remise du colis.
          </p>
          <p>Aucun paiement en ligne ne vous sera demandé.</p>
        </InfoCard>
      </div>

      <div className="mt-8 border border-taupe/30">
        <h2 className="serif border-b border-taupe/25 px-5 py-4 text-lg">Détail de la commande</h2>
        <ul className="divide-y divide-taupe/20">
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`} className="flex justify-between gap-4 px-5 py-3 text-sm">
              <span className="text-anthracite">
                {item.name}
                {item.color && <span className="text-taupe"> - {item.color}</span>}
                <span className="text-taupe"> × {item.qty}</span>
              </span>
              <span className="whitespace-nowrap tabular-nums text-anthracite">{fcfa(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="flex flex-col gap-2 border-t border-taupe/25 px-5 py-4 text-sm">
          <Row label="Sous-total" value={fcfa(order.subtotal)} />
          <Row label="Livraison" value={order.shippingFee === 0 ? "Offerte" : fcfa(order.shippingFee)} />
          {order.discount > 0 && (
            <Row
              label={`Remise${order.promoCode ? ` (${order.promoCode})` : ""}`}
              value={`−${fcfa(order.discount)}`}
              accent
            />
          )}
          <div className="serif flex justify-between border-t border-taupe/25 pt-3 text-lg">
            <dt>Total à régler</dt>
            <dd className="tabular-nums">{fcfa(order.total)}</dd>
          </div>
        </dl>
      </div>

      {invoiceError && <p className="mt-4 text-sm text-bordeaux print:hidden">{invoiceError}</p>}

      <p className="mt-4 text-xs text-taupe">
        Pour toute question sur cette commande{shop.phone ? `, contactez-nous au ${shop.phone}` : ""} en indiquant le
        numéro {order.id}.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <button
          onClick={getInvoice}
          disabled={downloading}
          className="label-lux inline-flex items-center gap-2 bg-ink px-6 py-3.5 text-cream transition-colors hover:bg-anthracite disabled:opacity-60"
        >
          <Download /> {downloading ? "Préparation…" : "Télécharger ma facture"}
        </button>
        <Link
          to="/boutique"
          className="label-lux border border-ink px-6 py-3.5 text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Continuer mes achats
        </Link>
      </div>
    </section>
  );
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-taupe/30 p-5">
      <p className="label-lux flex items-center gap-2 text-taupe">
        {icon}
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-0.5 text-sm text-taupe">{children}</div>
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex justify-between ${accent ? "text-gold-deep" : "text-anthracite"}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
