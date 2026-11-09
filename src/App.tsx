import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { OfflineBanner } from './components/common/OfflineBanner';
import { HeroBanner } from './components/home/HeroBanner';
import { CategoryGrid } from './components/home/CategoryGrid';
import { FlashSale } from './components/home/FlashSale';
import { ProductSection } from './components/home/ProductSection';
import { RecentlyViewed } from './components/home/RecentlyViewed';
import { CustomerReviews } from './components/home/CustomerReviews';
import { NewsletterSignup } from './components/home/NewsletterSignup';
import { CheckoutView } from './components/checkout/CheckoutView';
import { ProductDetailView } from './components/product/ProductDetailView';
import { WishlistView } from './components/wishlist/WishlistView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { OrderSuccessModal } from './components/orders/OrderSuccessModal';
import { OrderTrackingModal } from './components/orders/OrderTrackingModal';
import { AuthModal } from './components/customer/AuthModal';
import { CustomerProfileModal } from './components/customer/CustomerProfileModal';
import { SupportModals } from './components/support/SupportModals';
import { ProductCompareDock } from './components/compare/ProductCompareDock';
import { ProductComparisonModal } from './components/compare/ProductComparisonModal';
import { FloatingLiveChat } from './components/chat/FloatingLiveChat';
import { ARVirtualTryOnModal } from './components/ar/ARVirtualTryOnModal';

const MainLayout: React.FC = () => {
  const { currentView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#2D1B22] selection:bg-[#BE0750] selection:text-white">
      {/* Offline Status Alert */}
      <OfflineBanner />

      {/* Primary Navigation */}
      <Header />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {currentView === 'store' && (
          <>
            <HeroBanner />
            <CategoryGrid />
            <FlashSale />
            <ProductSection />
            <RecentlyViewed />
            <CustomerReviews />
            <NewsletterSignup />
          </>
        )}


        {currentView === 'checkout' && <CheckoutView />}

        {currentView === 'product_detail' && <ProductDetailView />}

        {currentView === 'wishlist' && <WishlistView />}

        {currentView === 'admin' && <AdminDashboard />}
      </main>

      {/* Interactive Drawers, Overlays & Comparison Tools */}
      <CartDrawer />
      <QuickViewModal />
      <OrderSuccessModal />
      <OrderTrackingModal />
      <AuthModal />
      <CustomerProfileModal />
      <SupportModals />
      <ProductCompareDock />
      <ProductComparisonModal />
      <ARVirtualTryOnModal />
      <FloatingLiveChat />

      {/* Primary Brand Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainLayout />
      </StoreProvider>
    </AuthProvider>
  );
}
