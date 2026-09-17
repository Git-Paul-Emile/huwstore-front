import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import WhatsAppWidget from "../components/WhatsAppWidget";
import ScrollTopButton from "../components/ScrollTopButton";
import AuthModal from "../components/AuthModal";
import Toasts from "../components/Toasts";
import { useWishlistSync } from "../hooks/useWishlist";
import { useCartSync } from "../hooks/useCart";

export default function MainLayout() {
  // Verse les favoris et le panier pris avant connexion dans le compte, une
  // fois connectee.
  useWishlistSync();
  useCartSync();

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppWidget />
      <ScrollTopButton />
      <AuthModal />
      <Toasts />
    </div>
  );
}
