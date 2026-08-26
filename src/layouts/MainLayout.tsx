import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import WhatsAppWidget from "../components/WhatsAppWidget";
import AuthModal from "../components/AuthModal";
import Toasts from "../components/Toasts";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppWidget />
      <AuthModal />
      <Toasts />
    </div>
  );
}
