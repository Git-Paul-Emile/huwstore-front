import { useState } from "react";
import { useShop } from "../hooks/useSettings";
import { Close, WhatsApp } from "./icons";

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const shop = useShop();

  // Sans numero configure, le widget ne s'affiche pas : mieux vaut aucun bouton
  // qu'un bouton qui ouvre une discussion avec personne.
  if (!shop.whatsapp) return null;

  const href = `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
    `Bonjour ${shop.shopName}, je souhaite passer commande / avoir des informations.`,
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {/* Carte de contact */}
      {open && (
        <div className="w-72 overflow-hidden rounded-2xl border border-taupe/25 bg-cream shadow-[0_20px_50px_-20px_rgba(15,15,15,0.5)] animate-fade-up">
          <div className="flex items-center gap-3 bg-[#128C4B] px-4 py-3.5 text-cream">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/15 text-lg"><WhatsApp /></span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{shop.shopName}</p>
              <p className="text-[0.7rem] text-cream/80">En ligne - répond en quelques minutes</p>
            </div>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm leading-relaxed text-anthracite">
              Bonjour, commandez ou posez vos questions directement sur WhatsApp.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 bg-[#25D366] py-3 text-cream transition-colors hover:bg-[#128C4B]"
            >
              <span className="label-lux">Démarrer la discussion</span>
            </a>
          </div>
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Commander via WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-cream transition-colors hover:bg-[#128C4B] active:scale-95"
      >
        {open ? <Close className="text-2xl" /> : <WhatsApp className="text-2xl" />}
      </button>
    </div>
  );
}
