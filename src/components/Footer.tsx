import { Link } from "react-router-dom";
import logo from "../assets/logo2.svg";
import { useShop } from "../hooks/useSettings";
import { Facebook, Instagram, TikTok, WhatsApp } from "./icons";
import PaymentBadges from "./PaymentBadges";

/**
 * Pied de page.
 *
 * Chaque entrée pointe vers une page qui existe réellement : un lien mort dans
 * un pied de page coûte plus de confiance qu'il n'en rapporte. Les colonnes
 * décoratives d'avant (« Nos ateliers », « Presse », « Carrières »…) ont été
 * retirées faute de contenu derrière.
 */
const cols: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Boutique",
    links: [
      { label: "Toutes les pièces", to: "/boutique" },
      { label: "Nouveautés", to: "/boutique?tri=nouveautes" },
      { label: "Mon compte", to: "/compte" },
      { label: "Mes favoris", to: "/compte" },
    ],
  },
  {
    title: "Service client",
    links: [{ label: "Nous contacter", to: "/contact" }],
  },
  {
    title: "Informations",
    links: [
      { label: "Conditions générales", to: "/cgu" },
      { label: "Politique de confidentialité", to: "/confidentialite" },
    ],
  },
];

export default function Footer() {
  const shop = useShop();

  // Les liens sociaux ne sont affiches que s'ils sont renseignes : un lien vide
  // vaut moins que pas de lien du tout.
  const socials = [
    { label: "Facebook", href: shop.facebookUrl, Icon: Facebook },
    { label: "Instagram", href: shop.instagramUrl, Icon: Instagram },
    { label: "WhatsApp", href: shop.whatsappUrl, Icon: WhatsApp },
    { label: "TikTok", href: shop.tiktokUrl, Icon: TikTok },
  ].filter((social): social is { label: string; href: string; Icon: typeof Facebook } => Boolean(social.href));

  return (
    <footer className="mt-24 bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <img src={logo} alt="HUWSTORE" className="h-20 w-auto md:h-24" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">
              Alliez style et praticité au quotidien. Livraison partout au Sénégal. Paiement à la livraison sur Dakar, par Wave ou Orange Money en région.
            </p>

            {socials.length > 0 && (
              <div className="mt-6">
                <p className="label-lux text-gold">Suivez-nous</p>
                <div className="mt-4 flex gap-3">
                  {socials.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid h-10 w-10 place-items-center rounded-full border border-gold/40 text-lg text-gold transition-colors hover:border-gold hover:bg-gold hover:text-ink"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <p className="label-lux text-gold">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-cream/70 transition-colors hover:text-cream">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {c.title === "Informations" && (
                <div className="mt-6">
                  <p className="label-lux text-gold">Paiements</p>
                  <div className="mt-3">
                    <PaymentBadges />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-cream/15 pt-6 text-center text-xs text-cream/50">
          <p>
            © {new Date().getFullYear()} {shop.shopName} - Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
