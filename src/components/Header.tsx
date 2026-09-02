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

  useEffect(() => {
    if (!zone && zones.length > 0) setZone(zones[0]);
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

  return (
    <>
      <div ref={navRef}>
      {/* Bandeau d'annonce : texte saisi dans Paramètres, masqué s'il est vide. */}
      {shop.announcement && (
        <div className="bg-ink text-cream overflow-hidden">
          <div className="flex w-max animate-marquee whitespace-nowrap py-2.5">
            {[shop.announcement, shop.announcement].map((message, i) => (
              <span key={i} className="label-lux mx-10 text-[0.62rem] text-cream/80">
                {message}
              </span>
            ))}
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
