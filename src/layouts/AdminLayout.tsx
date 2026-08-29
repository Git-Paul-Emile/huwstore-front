import { useEffect, useState, type ReactElement } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { ToastProvider } from "../components/admin/ui";
import { useShop } from "../hooks/useSettings";
import { useLogout } from "../hooks/useAuth";
import {
  Grid, Box, Layers, Users, Image, Truck, Tag, Chat, Chart, Cog, Archive,
  Bell, LogOut, Search, ChevronLeft, ChevronRight, Command, ArrowRight,
} from "../components/icons";

const nav: { path: string; label: string; icon: (p: { className?: string }) => ReactElement }[] = [
  { path: "", label: "Tableau de bord", icon: Grid },
  { path: "produits", label: "Produits", icon: Box },
  { path: "categories", label: "Catégories", icon: Archive },
  { path: "stock", label: "Stock", icon: Layers },
  { path: "commandes", label: "Commandes & livraison", icon: Truck },
  { path: "clients", label: "Clients", icon: Users },
  { path: "bannieres", label: "Bannières", icon: Image },
  { path: "promos", label: "Promotions", icon: Tag },
  { path: "temoignages", label: "Témoignages", icon: Chat },
  { path: "avis", label: "Avis sur le site", icon: Bell },
  { path: "stats", label: "Statistiques", icon: Chart },
  { path: "parametres", label: "Paramètres", icon: Cog },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const shop = useShop();
  const logout = useLogout();
  const [collapsed, setCollapsed] = useState(false);
  const [palette, setPalette] = useState(false);
  const [pq, setPq] = useState("");

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const paletteResults = nav.filter((n) => n.label.toLowerCase().includes(pq.toLowerCase()));

  function signOut() {
    logout.mutate(undefined, { onSettled: () => navigate("/") });
  }

  return (
    <div className="adm flex min-h-screen" style={{ background: "var(--adm-bg)" }}>
      <ToastProvider>
        {/* Sidebar */}
        <aside
          className={`sticky top-0 flex h-screen flex-col transition-all ${collapsed ? "w-16" : "w-60"}`}
          style={{ background: "var(--adm-nav)", color: "var(--adm-nav-text)" }}
        >
          <div className="flex items-center gap-2 px-4 py-5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#c9a876] text-sm font-bold text-black">
              {shop.shopName.slice(0, 2).toUpperCase()}
            </span>
            {!collapsed && (
              <div className="leading-tight">
                <p className="serif text-base">{shop.shopName}</p>
                <p className="text-[0.6rem] opacity-60">Back-office</p>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 px-2 py-2">
            {nav.map((n) => {
              const Icon = n.icon;
              return (
                <NavLink
                  key={n.path}
                  to={n.path}
                  end={n.path === ""}
                  title={n.label}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-[#c9a876] text-black" : "hover:bg-[var(--adm-nav-hover)]"}`
                  }
                >
                  <span className="text-lg"><Icon /></span>
                  {!collapsed && <span>{n.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="m-2 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm hover:bg-[var(--adm-nav-hover)]"
          >
            {collapsed ? <ChevronRight /> : <><ChevronLeft /> Réduire</>}
          </button>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header
            className="sticky top-0 z-40 flex items-center gap-4 border-b px-6 py-3"
            style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
          >
            <button
              onClick={() => setPalette(true)}
              className="flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-sm max-w-md"
              style={{ borderColor: "var(--adm-border)", color: "var(--adm-muted)" }}
            >
              <Search /> Recherche rapide…
              <span className="ml-auto flex items-center gap-1 rounded border px-1.5 py-0.5 text-[0.65rem]" style={{ borderColor: "var(--adm-border)" }}>
                <Command /> K
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--adm-hover)]" style={{ color: "var(--adm-text)" }}>
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#c9a876] text-xs font-bold text-black">
                  {shop.shopName.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden sm:inline">Voir la boutique</span>
              </button>
              <button
                onClick={signOut}
                disabled={logout.isPending}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--adm-hover)] disabled:opacity-60"
                style={{ color: "var(--adm-text)" }}
              >
                <LogOut />
                <span className="hidden sm:inline">Se déconnecter</span>
              </button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>

        {/* Command palette */}
        {palette && (
          <div className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-28" onClick={() => setPalette(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl animate-fade-up"
              style={{ background: "var(--adm-surface)", borderColor: "var(--adm-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--adm-border)", color: "var(--adm-muted)" }}>
                <Search />
                <input
                  autoFocus value={pq} onChange={(e) => setPq(e.target.value)}
                  placeholder="Aller à un module…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--adm-text)" }}
                />
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {paletteResults.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.path}
                      onClick={() => { navigate(n.path); setPalette(false); setPq(""); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--adm-hover)]"
                      style={{ color: "var(--adm-text)" }}
                    >
                      <Icon /> {n.label}
                      <ArrowRight className="ml-auto" />
                    </button>
                  );
                })}
                {paletteResults.length === 0 && <p className="px-3 py-4 text-sm" style={{ color: "var(--adm-muted)" }}>Aucun résultat.</p>}
              </div>
              <div className="border-t px-4 py-2 text-center text-[0.65rem]" style={{ borderColor: "var(--adm-border)", color: "var(--adm-muted)" }}>
                {shop.shopName} - Échap pour fermer
              </div>
            </div>
          </div>
        )}
      </ToastProvider>
    </div>
  );
}
