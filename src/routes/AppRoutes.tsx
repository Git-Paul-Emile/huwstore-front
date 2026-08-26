import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import Listing from "../pages/Listing";
import Product from "../pages/Product";
import Account from "../pages/Account";
import NotFoundPage from "../pages/NotFoundPage";
import Dashboard from "../pages/admin/Dashboard";
import Products from "../pages/admin/Products";
import Stock from "../pages/admin/Stock";
import Clients from "../pages/admin/Clients";
import Banners from "../pages/admin/Banners";
import Orders from "../pages/admin/Orders";
import Promos from "../pages/admin/Promos";
import Reviews from "../pages/admin/Reviews";
import Stats from "../pages/admin/Stats";
import Settings from "../pages/admin/Settings";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="boutique" element={<Listing />} />
        <Route path="boutique/:category" element={<Listing />} />
        <Route path="produit/:id" element={<Product />} />
        <Route path="compte" element={<Account />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="produits" element={<Products />} />
        <Route path="stock" element={<Stock />} />
        <Route path="commandes" element={<Orders />} />
        <Route path="clients" element={<Clients />} />
        <Route path="bannieres" element={<Banners />} />
        <Route path="promos" element={<Promos />} />
        <Route path="avis" element={<Reviews />} />
        <Route path="stats" element={<Stats />} />
        <Route path="parametres" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
