import { lazy, Suspense, useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Chalets from "./components/Chalets.jsx";
import Gallery from "./components/Gallery.jsx";
import { TrustBar, Amenities, Guanica, Reviews, Faq } from "./components/Sections.jsx";
import { Contact, Footer, WhatsAppFab } from "./components/Contact.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";
import { useSite } from "./context/SiteContext.jsx";

// El panel de administración solo se descarga cuando se abre (no pesa para los huéspedes).
const AdminPanel = lazy(() => import("./admin/AdminPanel.jsx"));
// El calendario de reservas se descarga la primera vez que alguien toca "Reservar".
const BookingModal = lazy(() => import("./booking/BookingModal.jsx"));

export default function App() {
  const { adminOpen, loadError, bookingOpen } = useSite();
  const [bookingLoaded, setBookingLoaded] = useState(false);
  useEffect(() => { if (bookingOpen) setBookingLoaded(true); }, [bookingOpen]);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Saltar al contenido</a>
      <Navbar />
      <main id="main">
        <span id="top" />
        <Hero />
        <TrustBar />
        <Chalets />
        <Amenities />
        <Gallery />
        <Guanica />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
      {bookingLoaded && (
        <Suspense fallback={null}>
          <BookingModal />
        </Suspense>
      )}
      <AdminLogin />
      {adminOpen && (
        <Suspense fallback={null}>
          <AdminPanel />
        </Suspense>
      )}
      {loadError && <div role="status" className="fixed bottom-4 left-4 z-40 max-w-xs rounded-xl bg-tinta px-3 py-2 text-sm text-white">{loadError}</div>}
    </>
  );
}
