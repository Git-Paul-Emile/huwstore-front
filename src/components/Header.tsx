import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore, useCartTotals } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { useCategories } from "../hooks/useCategories";
import { useDeliveryZones } from "../hooks/useDeliveryZones";
import type { Category } from "../data";
import { Search, User, Heart, Bag, Menu, Close } from "./icons";
import logoDark from "../assets/logo1.svg";

const announcements = [
  "Livraison en moins de 24h à Dakar excepté les dimanches",
];

const nav = ["Nouveautés", "Collections", "Sacs", "Petite Maroquinerie", "Contact"];

export default function Header() {
  const navigate = useNavigate();
  const { count } = useCartTotals();
  const wishlist = useCartStore((s) => s.wishlist);
  const setCartOpen = useCartStore((s) => s.setCartOpen);
  const zone = useCartStore((s) => s.zone);
  const setZone = useCartStore((s) => s.setZone);
  const user = useAuthStore((s) => s.user);
  const setAuthOpen = useAuthStore((s) => s.setAuthOpen);
  const { data: categories = [] } = useCategories();
  const { data: zones = [] } = useDeliveryZones();

  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (!zone && zones.length > 0) setZone(zones[0]);
  }, [zone, zones, setZone]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Contenu du méga-menu par onglet : liste de liens + 3 catégories mises en avant.
  const menuData: Record<string, { heading: string; links: string[]; feature: Category[] }> = {
    "Nouveautés": { heading: "Dernières arrivées", links: ["Tout voir", "Cette semaine", "Éditions limitées", "Retour en stock", "Bientôt disponible"], feature: [categories[3], categories[0], categories[6]].filter(Boolean) },
    "Collections": { heading: "Nos collections", links: ["Maison Aurélie", "Atelier Rive", "Ligne Nappa", "Cuirs tannés végétal", "Archives"], feature: [categories[1], categories[2], categories[4]].filter(Boolean) },
    "Sacs": { heading: "Par catégorie", links: categories.map((c) => c.name), feature: [categories[0], categories[1], categories[2]].filter(Boolean) },
    "Petite Maroquinerie": { heading: "L'essentiel du quotidien", links: ["Pochettes", "Porte-cartes", "Portefeuilles", "Porte-clés", "Trousses"], feature: [categories[6], categories[2], categories[3]].filter(Boolean) },
    "Contact": { heading: "Nous rencontrer", links: ["Boutique Paris", "Service client", "Prendre rendez-vous", "Réparations", "FAQ"], feature: [categories[5], categories[6], categories[1]].filter(Boolean) },
  };
  const activeMenu = mega ? menuData[mega] : null;

  return (
    <>
      {/* Bandeau annonce */}
      <div className="bg-ink text-cream overflow-hidden">
        <div className="flex w-max animate-marquee whitespace-nowrap py-2.5">
          {[...announcements, ...announcements].map((a, i) => (
            <span key={i} className="label-lux mx-10 text-[0.62rem] text-cream/80">
              {a.split("BIENVENUE10").map((part, j, arr) =>
                j < arr.length - 1 ? (
                  <span key={j}>{part}<span className="text-gold">BIENVENUE10</span></span>
                ) : (
                  <span key={j}>{part}</span>
                ),
              )}
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          scrolled ? "bg-cream/95 shadow-[0_1px_0_rgba(184,175,163,0.35),0_8px_24px_-18px_rgba(15,15,15,0.4)] backdrop-blur" : "bg-cream"
        }`}
        onMouseLeave={() => setMega(null)}
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 md:px-10 py-4">
          {/* left nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.slice(0, 3).map((n) => (
              <button
                key={n}
                onMouseEnter={() => setMega(n)}
                onClick={() => { navigate("/boutique"); setMega(null); }}
                className={`label-lux transition-colors hover:text-gold-deep ${mega === n ? "text-gold-deep" : "text-anthracite"}`}
              >
                {n}
              </button>
            ))}
          </nav>
          <button className="lg:hidden justify-self-start text-2xl text-ink" onClick={() => setMobile(true)} aria-label="Menu">
            <Menu />
          </button>

          {/* logo */}
          <button onClick={() => navigate("/")} className="justify-self-center" aria-label="Accueil HUWSTORE">
            <img src={logoDark} alt="HUWSTORE" className="h-10 w-auto md:h-12" />
          </button>

          {/* right nav + icons */}
          <div className="flex items-center justify-end gap-5">
            <nav className="hidden items-center gap-7 lg:flex">
              {nav.slice(3).map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setMega(n)}
                  onClick={() => { navigate("/boutique"); setMega(null); }}
                  className={`label-lux transition-colors hover:text-gold-deep ${mega === n ? "text-gold-deep" : "text-anthracite"}`}
                >
                  {n}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3.5 text-[1.2rem] text-ink">
              <button aria-label="Recherche" className="transition-colors hover:text-gold-deep"><Search /></button>
              <button
                aria-label="Compte"
                onClick={() => (user ? navigate("/compte") : setAuthOpen(true))}
                className="relative hidden transition-colors hover:text-gold-deep sm:block"
              >
                <User />
                {user && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-gold" />}
              </button>
              <button aria-label="Favoris" className="relative transition-colors hover:text-gold-deep">
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
        </div>

        {/* Mega menu */}
        {activeMenu && (
          <div
            className="absolute inset-x-0 top-full hidden border-t border-taupe/25 bg-cream lg:block animate-fade-up"
            onMouseEnter={() => setMega(mega)}
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_2fr] gap-12 px-10 py-9">
              <div>
                <p className="label-lux text-taupe">{activeMenu.heading}</p>
                <ul className="mt-4 space-y-2.5">
                  {activeMenu.links.map((l) => (
                    <li key={l}>
                      <button
                        onClick={() => { navigate("/boutique"); setMega(null); }}
                        className="serif text-lg text-anthracite transition-colors hover:text-gold-deep"
                      >
                        {l}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {activeMenu.feature.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { navigate(`/boutique/${encodeURIComponent(c.name)}`); setMega(null); }}
                    className="group text-left"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-cream-tint">
                      <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="label-lux mt-3 text-anthracite group-hover:text-gold-deep">{c.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobile(false)} />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-cream p-6 animate-slide-in">
            <div className="flex items-center justify-between">
              <img src={logoDark} alt="HUWSTORE" className="h-9 w-auto" />
              <button onClick={() => setMobile(false)} className="text-2xl"><Close /></button>
            </div>
            <nav className="mt-8 flex flex-col">
              {nav.map((n) => (
                <button
                  key={n}
                  onClick={() => { navigate("/boutique"); setMobile(false); }}
                  className="serif border-b border-taupe/20 py-4 text-left text-xl text-ink"
                >
                  {n}
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
