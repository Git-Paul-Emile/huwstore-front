import waveLogo from "../assets/wave.png";
import orangeMoneyLogo from "../assets/orange-money.png";
import { useShop } from "../hooks/useSettings";

/**
 * Logos espèces / Wave / Orange Money, partagés entre la fiche produit, le
 * pied de page et le paiement. Wave et Orange Money sont cliquables : ils
 * ouvrent directement le lien de paiement renseigné dans Paramètres.
 * Orange Money reste masqué tant que ce lien n'est pas encore fourni par la
 * boutique - inutile d'afficher un bouton qui ne mène nulle part.
 */
export default function PaymentBadges({ size = "md" }: { size?: "sm" | "md" }) {
  const shop = useShop();
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const emojiSize = size === "sm" ? "text-lg" : "text-2xl";

  return (
    <div className="flex items-center gap-3">
      <span
        aria-label="Espèces"
        title="Espèces"
        className={`grid ${dim} place-items-center rounded-full bg-cream ${emojiSize}`}
      >
        💵
      </span>
      {shop.wavePaymentUrl && (
        <a href={shop.wavePaymentUrl} target="_blank" rel="noopener noreferrer" aria-label="Payer avec Wave" title="Payer avec Wave">
          <img src={waveLogo} alt="Wave" className={`${dim} rounded-full object-cover`} />
        </a>
      )}
      {shop.orangeMoneyUrl && (
        <a
          href={shop.orangeMoneyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Payer avec Orange Money"
          title="Payer avec Orange Money"
        >
          <img src={orangeMoneyLogo} alt="Orange Money" className={`${dim} rounded-full object-cover`} />
        </a>
      )}
    </div>
  );
}

/**
 * Un seul logo cliquable, pour le moyen mobile money réellement choisi (ex.
 * dans le bloc de paiement hors Dakar, où espèces n'a pas sa place). Absent
 * si la boutique n'a pas encore renseigné le lien de ce moyen.
 */
export function PaymentMethodIcon({ method, size = "md" }: { method: "Wave" | "Orange Money"; size?: "sm" | "md" }) {
  const shop = useShop();
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const url = method === "Wave" ? shop.wavePaymentUrl : shop.orangeMoneyUrl;
  if (!url) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Payer avec ${method}`} title={`Payer avec ${method}`}>
      <img
        src={method === "Wave" ? waveLogo : orangeMoneyLogo}
        alt={method}
        className={`${dim} rounded-full object-cover`}
      />
    </a>
  );
}
