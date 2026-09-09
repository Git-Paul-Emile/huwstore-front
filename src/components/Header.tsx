import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCartStore, useCartTotals } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { useCategories } from "../hooks/useCategories";
import { useDeliveryZones } from "../hooks/useDeliveryZones";
import { useWishlist } from "../hooks/useWishlist";
import { useShop } from "../hooks/useSettings";
import { Search, User, Heart, Bag, Menu, Close } from "./icons";
import logoDark from "../assets/logo1.svg";

/**
 * Promesses de la boutique, affichées dans le ruban du haut SUR LA PAGE
 * D'ACCUEIL seulement (demande du 09/09/2026 : elles ont quitté leur section
 * sous le bandeau d'accueil pour venir au-dessus du menu).
 *
 * Chacune correspond à une règle réellement appliquée : une phrase affichée en
 * vitrine engage la boutique aussi sûrement qu'un contrat, et une promesse non
 * tenue se paie au moment de la livraison. N'en ajouter aucune qui ne le soit
 * pas.
 *
 * Une seule ligne chacune, sans titre séparé : un ruban défile, il n'a pas de
 * seconde ligne où poser un détail.
 */
const PROMESSES = [
  "Livrée partout au Sénégal : Dakar, banlieue et régions",
  "Livraison 24 h sur Dakar sauf le dimanche, 72 h en région",
  "Paiement en espèces à la livraison sur Dakar, Wave ou Orange Money en région",
];

/**
 * Onglets de navigation. `to` mène vers une page ; `anchor` défile jusqu'à une
 * section de la page d'accueil (identifiée par son `id`), en y naviguant
 * d'abord si on se trouve ailleurs sur le site.
 */
type NavItem = { label: string; to: string } | { label: string; anchor: string };
const nav: NavItem[] = [
  { label: "Accueil", to: "/" },
  { label: "Boutique", to: "/boutique" },
  { label: "Meilleures ventes", anchor: "meilleures-ventes" },
  { label: "Nouveautés", anchor: "nouveautes" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const shop = useShop();
  const { count } = useCartTotals();
  const { ids: wishlist } = useWishlist();
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const zone = useCartStore((s) => s.zone);
  const setZone = useCartStore((s) => s.setZone);
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAuthStore((s) => s.setAuthOpen);
  const { data: categories = [] } = useCategories();
  const { data: zones = [] } = useDeliveryZones();

  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const setHeaderHeight = useLayoutStore((s) => s.setHeaderHeight);
  const navRef = useRef<HTMLDivElement>(null);

  // Mesure réelle (bandeau d'annonce compris) : elle varie selon que le
  // bandeau est affiché et selon la taille du logo au changement de largeur -
  // impossible à coder en dur sans que le bloc d'accueil ne déborde ou ne
  // laisse un vide sous la navbar.
  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [setHeaderHeight]);

  // Le panier garde la zone de livraison en mémoire locale. On la réaligne sur
  // la liste réelle du serveur : une zone supprimée (ex. une ville de test)
  // retombe sur la première zone valide, une zone renommée ou retarifée est
  // resynchronisée. Sans ça, le panier peut afficher « Abidjan - 3 000 FCFA »
  // alors que la boutique ne livre qu'au Sénégal.
  useEffect(() => {
    if (zones.length === 0) return;
    if (!zone) {
      setZone(zones[0]);
      return;
    }
    const fresh = zones.find((z) => z.id === zone.id);
    if (!fresh) {
      setZone(zones[0]);
      return;
    }
    if (
      fresh.city !== zone.city ||
      fresh.country !== zone.country ||
      fresh.fee !== zone.fee ||
      fresh.freeFrom !== zone.freeFrom ||
      fresh.delay !== zone.delay
    ) {
      setZone(fresh);
    }
  }, [zone, zones, setZone]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Un onglet mène soit vers une page (`to`), soit vers une section de
   * l'accueil (`anchor`). Depuis une autre page, on rejoint d'abord l'accueil
   * avec le fragment dans l'URL : `Home` se charge ensuite d'y défiler.
   */
  const goToNavItem = (item: NavItem) => {
    setMobile(false);
    if ("anchor" in item) {
      if (location.pathname === "/") {
        document.getElementById(item.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        navigate(`/#${item.anchor}`);
      }
      return;
    }
    navigate(item.to);
  };

  // Le ruban ne porte les promesses que sur l'accueil. `headerHeight` est
  // mesuré par un ResizeObserver, la hauteur du haut de page suit donc toute
  // seule d'une page à l'autre : rien à corriger côté bandeau d'accueil.
  const ruban = [...(shop.announcement ? [shop.announcement] : []), ...(location.pathname === "/" ? PROMESSES : [])];

  const serieRuban = ruban.map((message, i) => (
    <span key={i} className="flex items-center">
      <span aria-hidden className="mx-8 h-3 w-px shrink-0 bg-gold/45" />
      <span className="label-lux text-[0.62rem] text-cream/80">{message}</span>
    </span>
  ));

  return (
    <>
      <div ref={navRef}>
      {/* Ruban du haut, au-dessus du menu.
 
          Il porte l'annonce saisie dans Paramètres, sur toutes les pages, et
          les trois promesses de la boutique sur la seule page d'accueil. Un
          SEUL ruban et non deux bandes superposées : deux bandes noires avant
          le logo repoussent le contenu d'autant, et la visiteuse ne sait plus
          laquelle lire.

          L'annonce reste affichée partout : la boutique s'en sert pour une
          promotion ou une fermeture, la restreindre à l'accueil lui retirerait
          un moyen de prévenir.

          Séparateur : un filet vertical doré, pas un point médian - celui-ci
          est interdit par `rules/00-socle/conventions-redaction.md`, en noir
          comme en couleur.

          La seconde série est là pour que la boucle soit continue : au bout de
          l'animation le ruban a défilé de la moitié de sa largeur, donc
          exactement d'une série, et le raccord est invisible. Elle porte
          `aria-hidden` et `inert`, sinon la visiteuse entend deux fois les
          mêmes promesses au lecteur d'écran et les traverse deux fois au
          clavier. */}
      {ruban.length > 0 && (
        <div className="overflow-hidden bg-ink text-cream">
          {/* La durée suit le nombre de messages : à durée fixe, un ruban deux
              fois plus long défilerait deux fois plus vite et deviendrait
              illisible. Plancher à 28 s, la valeur d'origine quand il n'y a que
              l'annonce. */}
          <div
            className="flex w-max animate-marquee items-center whitespace-nowrap py-2.5"
            style={{ animationDuration: `${Math.max(28, ruban.length * 16)}s` }}
          >
            <div className="flex items-center">{serieRuban}</div>
            <div className="flex items-center" aria-hidden inert>
              {serieRuban}
            </div>
          </div>
        </div>
      )}

      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled ? "bg-cream/95 shadow-[0_1px_0_rgba(184,175,163,0.35),0_8px_24px_-18px_rgba(15,15,15,0.4)] backdrop-blur" : "bg-cream"
        }`}
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-10 py-4">
          {/* menu, à gauche (bouton hamburger en dessous de xl, où les cinq
              onglets ne tiennent plus dans un tiers de la barre) */}
          <div className="flex min-w-0 items-center gap-6 justify-self-start">
            <button className="xl:hidden text-2xl text-ink" onClick={() => setMobile(true)} aria-label="Menu">
              <Menu />
            </button>
            <nav className="hidden items-center gap-6 xl:flex">
              {nav.map((n) => (
                <button
                  key={n.label}
                  onClick={() => goToNavItem(n)}
                  className="label-lux whitespace-nowrap text-anthracite transition-colors hover:text-gold-deep"
                >
                  {n.label}
                </button>
              ))}
            </nav>
          </div>

          {/* logo, au centre */}
          <button
            onClick={() => navigate("/")}
            aria-label="Accueil HUWSTORE"
            className="justify-self-center"
          >
            <img src={logoDark} alt="HUWSTORE" className="h-10 w-auto md:h-12" />
          </button>

          {/* icônes, à droite */}
          <div className="flex items-center justify-end gap-3.5 justify-self-end text-[1.2rem] text-ink">
            <button
              onClick={() => navigate("/boutique")}
              aria-label="Rechercher dans la boutique"
              className="transition-colors hover:text-gold-deep"
            >
              <Search />
            </button>
            <button
              aria-label="Compte"
              onClick={() => (user ? navigate("/compte") : setAuthOpen(true))}
              className="relative hidden transition-colors hover:text-gold-deep sm:block"
            >
              <User />
              {user && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-gold" />}
            </button>
            <button
              aria-label="Favoris"
              onClick={() => (user ? navigate("/compte?tab=wishlist") : setAuthOpen(true))}
              className="relative transition-colors hover:text-gold-deep"
            >
              <Heart />
              {wishlist.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[0.55rem] font-semibold text-ink">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button aria-label="Panier" onClick={() => setCartOpen(true)} className="relative transition-colors hover:text-gold-deep">
              <Bag />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[0.55rem] font-semibold text-ink">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      </div>

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobile(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-cream p-6 animate-slide-in">
            <div className="flex items-center justify-between">
              <img src={logoDark} alt="HUWSTORE" className="h-9 w-auto" />
              <button onClick={() => setMobile(false)} className="text-2xl"><Close /></button>
            </div>
            <nav className="mt-8 flex flex-col">
              {nav.map((n) => (
                <button
                  key={n.label}
                  onClick={() => goToNavItem(n)}
                  className="serif border-b border-taupe/20 py-4 text-left text-xl text-ink"
                >
                  {n.label}
                </button>
              ))}
            </nav>
            <p className="label-lux mt-8 text-taupe">Catégories</p>
            <div className="mt-3 flex flex-col gap-2.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { navigate(`/boutique/${encodeURIComponent(c.name)}`); setMobile(false); }}
                  className="text-left text-sm text-anthracite"
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
