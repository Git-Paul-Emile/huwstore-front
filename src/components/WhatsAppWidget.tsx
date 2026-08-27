import { useState } from "react";
import { SHOP_PHONE_WA } from "../data";
import { Close, WhatsApp } from "./icons";

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const href = `https://wa.me/${SHOP_PHONE_WA}?text=${encodeURIComponent(
    "Bonjour HUWSTORE, je souhaite passer commande / avoir des informations.",
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {/* Carte de contact */}
      {open && (
        <div className="w-72 overflow-hidden rounded-2xl border border-taupe/25 bg-cream shadow-[0_20px_50px_-20px_rgba(15,15,15,0.5)] animate-fade-up">
          <div className="flex items-center gap-3 bg-[#128C4B] px-4 py-3.5 text-cream">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/15 text-lg"><WhatsApp /></span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">HUWSTORE</p>
              <p className="text-[0.7rem] text-cream/80">En ligne · répond en quelques minutes</p>
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
        className="group flex items-center gap-2.5 rounded-full bg-[#25D366] py-3.5 pl-4 pr-5 text-cream shadow-[0_12px_30px_-8px_rgba(37,211,102,0.7)] transition-all hover:bg-[#128C4B] active:scale-95"
      >
        {open ? <Close className="text-2xl" /> : <WhatsApp className="text-2xl" />}
        <span className="label-lux hidden text-cream sm:inline">Commander sur WhatsApp</span>
      </button>
    </div>
  );
}
