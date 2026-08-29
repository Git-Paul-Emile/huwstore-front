import { useState } from "react";
import { LegalPage, Section } from "./LegalLayout";
import { useShop } from "../../hooks/useSettings";
import { WhatsApp, Phone } from "../../components/icons";
import { useSeo } from "../../hooks/useSeo";
import { useCreateFeedback } from "../../hooks/useFeedback";
import { useToastStore } from "../../store/useToastStore";
import { readApiError } from "../../api/axiosConfig";

/**
 * Page contact. Volontairement sans formulaire pour les questions de service
 * (commande, livraison) : la boutique y répond par téléphone et par WhatsApp,
 * un formulaire qui n'aboutit nulle part vaut moins qu'un numéro sur lequel on
 * peut appuyer. Le petit formulaire d'avis ci-dessous est différent : c'est un
 * retour libre sur le site lui-même, lu depuis le back-office, pas une demande
 * qui attend une réponse.
 */
export default function Contact() {
  const shop = useShop();
  useSeo({ title: "Nous contacter", description: "Téléphone et WhatsApp de la boutique HUWSTORE, du lundi au samedi de 9h à 19h." });

  return (
    <LegalPage title="Nous contacter" updatedAt="août 2026">
      <Section title="Par téléphone ou WhatsApp">
        <p>Nous répondons du lundi au samedi, de 9h à 19h.</p>
        <div className="mt-2 flex flex-wrap gap-3">
          <a
            href={`tel:+${shop.whatsapp || shop.phone}`}
            className="label-lux flex items-center gap-2 border border-ink px-5 py-3 text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            <Phone className="text-base" /> {shop.phone}
          </a>
          <a
            href={`https://wa.me/${shop.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="label-lux flex items-center gap-2 border border-[#25D366] bg-[#25D366]/10 px-5 py-3 text-[#128C4B] transition-colors hover:bg-[#25D366]/20"
          >
            <WhatsApp className="text-base" /> Écrire sur WhatsApp
          </a>
        </div>
      </Section>

      <Section title="Un avis sur le site">
        <p>Une suggestion, une remarque sur votre expérience d'achat ? Laissez-nous un mot, sans avoir besoin d'un compte.</p>
        <FeedbackForm />
      </Section>
    </LegalPage>
  );
}

function FeedbackForm() {
  const toast = useToastStore((s) => s.toast);
  const createFeedback = useCreateFeedback();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!message.trim()) return;
    setError("");
    createFeedback.mutate(
      { name: name.trim() || undefined, message: message.trim() },
      {
        onSuccess: () => {
          toast("Merci pour votre avis !");
          setName("");
          setMessage("");
        },
        onError: (e) => setError(readApiError(e, "Impossible d'envoyer votre avis pour le moment.")),
      },
    );
  };

  return (
    <div className="mt-2 flex flex-col gap-3">
      <label htmlFor="feedback-name" className="sr-only">Votre nom</label>
      <input
        id="feedback-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom (facultatif)"
        className="border border-taupe/40 bg-cream px-3 py-2.5 text-sm outline-none focus:border-gold"
      />
      <label htmlFor="feedback-message" className="sr-only">Votre avis</label>
      <textarea
        id="feedback-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Votre avis"
        className="border border-taupe/40 bg-cream px-3 py-2.5 text-sm outline-none focus:border-gold"
      />
      {error && (
        <p role="alert" className="text-xs text-bordeaux">{error}</p>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={createFeedback.isPending || !message.trim()}
        className="label-lux self-start border border-ink px-5 py-2.5 text-ink transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-40"
      >
        {createFeedback.isPending ? "Envoi…" : "Envoyer"}
      </button>
    </div>
  );
}
