import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import RequireAdmin from "../components/RequireAdmin";
import ScrollToTop from "../components/ScrollToTop";
import { useRestoreSession } from "../hooks/useAuth";
import Home from "../pages/Home";
import Listing from "../pages/Listing";
import Product from "../pages/Product";
import Checkout from "../pages/Checkout";
import OrderConfirmation from "../pages/OrderConfirmation";
import NotFoundPage from "../pages/NotFoundPage";

/**
 * Découpage du code (rules/frontend.md).
 *
 * Les écrans de la vitrine - accueil, boutique, fiche produit, panier - partent
 * dans le paquet principal : ce sont ceux qu'on ouvre en premier, souvent en 3G.
 *
 * Tout le reste est chargé À LA DEMANDE : le back-office entier, l'espace
 * client et les pages légales. Une cliente qui vient acheter un sac ne télécharge
 * donc jamais les 11 écrans d'administration.
 */
const Account = lazy(() => import("../pages/Account"));
const Confidentialite = lazy(() => import("../pages/legal/Confidentialite"));
const Contact = lazy(() => import("../pages/legal/Contact"));

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Products = lazy(() => import("../pages/admin/Products"));
const Categories = lazy(() => import("../pages/admin/Categories"));
const Stock = lazy(() => import("../pages/admin/Stock"));
const Clients = lazy(() => import("../pages/admin/Clients"));
const Banners = lazy(() => import("../pages/admin/Banners"));
const Orders = lazy(() => import("../pages/admin/Orders"));
const Promos = lazy(() => import("../pages/admin/Promos"));
const TestimonialsAdmin = lazy(() => import("../pages/admin/Testimonials"));
const FeedbackAdmin = lazy(() => import("../pages/admin/Feedback"));
const Stats = lazy(() => import("../pages/admin/Stats"));
const Settings = lazy(() => import("../pages/admin/Settings"));

/** Écran d'attente pendant le chargement d'un module. */
function Loading() {
  return <p className="px-5 py-24 text-center text-sm text-taupe">Chargement…</p>;
}

export function AppRoutes() {
  // Restaure la session (cookie -> nouveau jeton) avant tout rendu protégé.
  useRestoreSession();

  return (
    <Suspense fallback={<Loading />}>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="boutique" element={<Listing />} />
          <Route path="boutique/:category" element={<Listing />} />
          <Route path="produit/:id" element={<Product />} />
          <Route path="compte" element={<Account />} />
          <Route path="commande" element={<Checkout />} />
          <Route path="commande/:id" element={<OrderConfirmation />} />
          <Route path="confidentialite" element={<Confidentialite />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Back-office : la garde enveloppe la mise en page, donc AUCUNE page
            d'administration n'est rendue - ni même téléchargée - avant que le
            rôle soit vérifié. */}
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="produits" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="stock" element={<Stock />} />
          <Route path="commandes" element={<Orders />} />
          <Route path="clients" element={<Clients />} />
          <Route path="bannieres" element={<Banners />} />
          <Route path="promos" element={<Promos />} />
          <Route path="temoignages" element={<TestimonialsAdmin />} />
          <Route path="avis" element={<FeedbackAdmin />} />
          <Route path="stats" element={<Stats />} />
          <Route path="parametres" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
