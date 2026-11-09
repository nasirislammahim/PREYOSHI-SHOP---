import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Product, Category, CartItem, Order, Coupon, Banner, Review,
  StoreSettings, OrderStatus, DeliverySettings, PaymentSettings,
  NewsletterSubscriber, PriceDropAlert
} from '../types';
import {
  INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_BANNERS,
  INITIAL_COUPONS, INITIAL_REVIEWS, INITIAL_STORE_SETTINGS,
  INITIAL_NEWSLETTER_SUBSCRIBERS, INITIAL_PRICE_DROP_ALERTS
} from '../data/initialData';
import { StaffService } from '../services/staffService';



interface StoreContextType {
  // Catalogs
  products: Product[];
  categories: Category[];
  banners: Banner[];
  coupons: Coupon[];
  reviews: Review[];
  settings: StoreSettings;
  recentlyViewed: Product[];

  // Cart & Wishlist
  cart: CartItem[];
  wishlist: string[];
  appliedCoupon: Coupon | null;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  freeShippingProgress: {
    qualifies: boolean;
    remaining: number;
    threshold: number;
    percent: number;
  };
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  // Wishlist extended
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  moveWishlistToCart: (productId: string) => boolean;
  moveAllWishlistToCart: () => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;

  // Comparison Tool
  compareList: string[];
  addToCompare: (productId: string) => { success: boolean; message: string };
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;

  // Coupon handling
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Orders
  orders: Order[];
  placeOrder: (orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>) => Promise<{ success: boolean; orderId: string; orderNumber: string; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, courierName?: string, trackingNumber?: string) => void;
  trackOrder: (orderQuery: string, phoneQuery?: string) => Order | null;

  // Reviews & Moderation
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => void;
  getProductReviews: (productId: string, includeUnapproved?: boolean) => Review[];
  toggleHelpfulReview: (reviewId: string, userId?: string) => void;
  moderateReview: (reviewId: string, status: Review['status'], adminResponse?: Review['adminResponse']) => void;
  verifyCustomerPurchaseForProduct: (productId: string, userId?: string, phone?: string) => { isVerified: boolean; orderId?: string };
  claimGuestOrder: (orderNumber: string, phone: string, userId: string) => { success: boolean; message: string; count?: number };

  // Admin Product & Category operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetDemoData: () => void;
  clearDemoData: () => void;

  // Admin Banner & Coupon & Settings
  addBanner: (banner: Banner) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (code: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (code: string) => void;
  updateDeliverySettings: (delivery: Partial<DeliverySettings>) => void;
  updatePaymentSettings: (payment: Partial<PaymentSettings>) => void;

  // Search & Navigation Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;

  // Navigation & Modals UI state
  currentView: 'store' | 'checkout' | 'admin' | 'product_detail' | 'wishlist';
  setCurrentView: (view: 'store' | 'checkout' | 'admin' | 'product_detail' | 'wishlist') => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
  activePolicyModal: string | null;
  setActivePolicyModal: (policy: string | null) => void;
  latestConfirmedOrder: Order | null;
  setLatestConfirmedOrder: (order: Order | null) => void;
  recordProductView: (productId: string) => void;

  // Live Chat & AI Support
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;

  // AR Virtual Try-On
  isARModalOpen: boolean;
  setIsARModalOpen: (open: boolean) => void;
  arProduct: Product | null;
  setArProduct: (prod: Product | null) => void;
  openARTryOn: (prod?: Product | null) => void;
  closeARTryOn: () => void;

  // Newsletter & Customer Database
  newsletterSubscribers: NewsletterSubscriber[];
  subscribeNewsletter: (email: string, name?: string, phone?: string) => { success: boolean; isNew: boolean; couponCode: string; message: string };
  deleteNewsletterSubscriber: (id: string) => void;

  // Price Drop Alerts
  priceDropAlerts: PriceDropAlert[];
  savePriceDropAlert: (alertData: Omit<PriceDropAlert, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string; alertId: string };
  removePriceDropAlert: (alertId: string) => void;
  getUserPriceAlertForProduct: (productId: string, userId?: string) => PriceDropAlert | undefined;
}

const STORAGE_KEYS = {
  PRODUCTS: 'preyoshi_products_v1',
  CATEGORIES: 'preyoshi_categories_v1',
  CART: 'preyoshi_cart_v1',
  WISHLIST: 'preyoshi_wishlist_v1',
  ORDERS: 'preyoshi_orders_v1',
  COUPONS: 'preyoshi_coupons_v1',
  BANNERS: 'preyoshi_banners_v1',
  REVIEWS: 'preyoshi_reviews_v1',
  SETTINGS: 'preyoshi_settings_v1',
  RECENT: 'preyoshi_recent_v1',
  COMPARE: 'preyoshi_compare_v1',
  SUBSCRIBERS: 'preyoshi_subscribers_v1',
  PRICE_ALERTS: 'preyoshi_price_alerts_v1',
};



const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent or fallback state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CATEGORIES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['PRY-1001', 'PRY-1006'];
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPARE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const defaultDemoOrders: Order[] = [
      {
        id: 'PRY-ORD-103',
        orderNumber: 'PRY-2026-0815',
        customerName: 'Mahim Islam',
        phone: '01712-345678',
        email: 'nasirislammahimbd@gmail.com',
        userId: 'USR-GUEST',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Mirpur',
        areaVillage: 'Mirpur-10',
        deliveryAddress: 'House 14, Road 5, Block B, Mirpur-10, Dhaka',
        orderNotes: 'দয়া করে বিকেলে ডেলিভারি করবেন।',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        deliveryType: 'courier',
        courierName: 'Steadfast Courier',
        trackingNumber: 'STF-994821',
        subtotal: 7620,
        deliveryCharge: 70,
        discount: 0,
        grandTotal: 7690,
        status: 'shipped',
        isDemo: true,
        items: [
          {
            productId: 'PRY-1001',
            nameEn: 'Dhakai Traditional Jamdani Saree - Burgundy & Gold',
            nameBn: 'ঢাকাই ঐতিহ্যবাহী জামদানি শাড়ি - মেরুন ও সোনালী',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            price: 5850,
            quantity: 1,
            selectedSize: '12 Hand Standard (১২ হাত)',
            selectedColor: 'Burgundy & Gold'
          },
          {
            productId: 'PRY-1007',
            nameEn: 'Traditional Gold Plated Jhumka Earrings',
            nameBn: 'ঐতিহ্যবাহী গোল্ড প্লেটেড ঝুমকা কানের দুল',
            image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
            price: 1770,
            quantity: 1,
            selectedSize: 'Standard',
            selectedColor: 'Antique Gold'
          }
        ],
        createdAt: '2026-11-03T11:30:00Z'
      },
      {
        id: 'PRY-ORD-104',
        orderNumber: 'PRY-2026-0814',
        customerName: 'Mahim Islam',
        phone: '01712-345678',
        email: 'nasirislammahimbd@gmail.com',
        userId: 'USR-GUEST',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Mirpur',
        areaVillage: 'Mirpur-10',
        deliveryAddress: 'House 14, Road 5, Block B, Mirpur-10, Dhaka',
        paymentMethod: 'bkash',
        paymentStatus: 'verified',
        transactionId: 'BK88019X22',
        deliveryType: 'courier',
        courierName: 'Pathao Courier',
        trackingNumber: 'PTH-88219',
        subtotal: 4890,
        deliveryCharge: 70,
        discount: 0,
        grandTotal: 4960,
        status: 'delivered',
        isDemo: true,
        items: [
          {
            productId: 'PRY-1006',
            nameEn: '24K Gold Plated Kundan Bridal Choker Set',
            nameBn: '২৪ ক্যারেট গোল্ড প্লেটেড কুন্দন ব্রাইডাল চোকার সেট',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
            price: 4890,
            quantity: 1,
            selectedSize: 'Free Size Adjustable',
            selectedColor: 'Ruby Red & Pearl'
          }
        ],
        createdAt: '2026-10-29T10:15:00Z'
      },
      {
        id: 'PRY-ORD-105',
        orderNumber: 'PRY-2026-0816',
        customerName: 'Mahim Islam',
        phone: '01712-345678',
        email: 'nasirislammahimbd@gmail.com',
        userId: 'USR-GUEST',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Mirpur',
        areaVillage: 'Mirpur-10',
        deliveryAddress: 'House 14, Road 5, Block B, Mirpur-10, Dhaka',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        deliveryType: 'courier',
        subtotal: 8200,
        deliveryCharge: 70,
        discount: 0,
        grandTotal: 8270,
        status: 'processing',
        isDemo: true,
        items: [
          {
            productId: 'PRY-1002',
            nameEn: 'Exclusive Rajshahi Pure Silk Saree',
            nameBn: 'এক্সক্লুসিভ রাজশাহী পিওর সিল্ক শাড়ি',
            image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
            price: 8200,
            quantity: 1,
            selectedSize: '12 Hand Standard (১২ হাত)',
            selectedColor: 'Royal Magenta & Zari'
          }
        ],
        createdAt: '2026-11-05T09:10:00Z'
      },
      {
        id: 'PRY-ORD-101',
        orderNumber: 'PRY-2026-0812',
        customerName: 'Samira Akter',
        phone: '01711223344',
        email: 'samira@example.com',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Gulshan',
        areaVillage: 'Road 11',
        deliveryAddress: 'House 28, Road 11, Gulshan-1, Dhaka',
        orderNotes: 'Please call before delivery.',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        deliveryType: 'courier',
        courierName: 'Steadfast Courier',
        trackingNumber: 'STF-8892110',
        subtotal: 5850,
        deliveryCharge: 70,
        discount: 150,
        grandTotal: 5770,
        couponCode: 'EID150',
        status: 'shipped',
        isDemo: true,
        items: [
          {
            productId: 'PRY-1001',
            nameEn: 'Dhakai Traditional Jamdani Saree - Burgundy & Gold',
            nameBn: 'ঢাকাই ঐতিহ্যবাহী জামদানি শাড়ি - মেরুন ও সোনালী',
            image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
            price: 5850,
            quantity: 1,
            selectedSize: '12 Hand Standard (১২ হাত)',
            selectedColor: 'Burgundy & Gold'
          }
        ],
        createdAt: '2026-10-28T14:20:00Z'
      }
    ];

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        const hasGuestOrder = parsed.some(o => o.userId === 'USR-GUEST' || o.phone.includes('345678'));
        if (!hasGuestOrder) {
          const guestOrders = defaultDemoOrders.filter(d => d.userId === 'USR-GUEST');
          const merged = [...guestOrders, ...parsed];
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    } catch {}
    return defaultDemoOrders;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_COUPONS;
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BANNERS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REVIEWS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_STORE_SETTINGS;
  });

  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['PRY-1001', 'PRY-1006', 'PRY-1004'];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NEWSLETTER_SUBSCRIBERS;
  });

  const [priceDropAlerts, setPriceDropAlerts] = useState<PriceDropAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRICE_ALERTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PRICE_DROP_ALERTS;
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // UI state
  const [currentView, setCurrentView] = useState<'store' | 'checkout' | 'admin' | 'product_detail' | 'wishlist'>('store');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<string | null>(null);
  const [latestConfirmedOrder, setLatestConfirmedOrder] = useState<Order | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isARModalOpen, setIsARModalOpen] = useState(false);
  const [arProduct, setArProduct] = useState<Product | null>(null);

  const openARTryOn = useCallback((prod?: Product | null) => {
    if (prod) {
      setArProduct(prod);
    } else {
      const defaultJewel = products.find(p => p.categoryId === 'jewellery') || products[0];
      setArProduct(defaultJewel);
    }
    setIsARModalOpen(true);
  }, [products]);

  const closeARTryOn = useCallback(() => {
    setIsARModalOpen(false);
  }, []);

  // Sync to local storage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(compareList)); }, [compareList]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons)); }, [coupons]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners)); }, [banners]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recentlyViewedIds)); }, [recentlyViewedIds]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(newsletterSubscribers)); }, [newsletterSubscribers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PRICE_ALERTS, JSON.stringify(priceDropAlerts)); }, [priceDropAlerts]);


  // Derived calculations
  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.minOrder && cartSubtotal < appliedCoupon.minOrder) return 0;
    if (appliedCoupon.type === 'percentage') {
      return Math.round((cartSubtotal * appliedCoupon.value) / 100);
    }
    return Math.min(appliedCoupon.value, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const freeShippingProgress = useMemo(() => {
    const threshold = settings.delivery.freeDeliveryThreshold;
    const qualifies = cartSubtotal >= threshold;
    const remaining = Math.max(0, threshold - cartSubtotal);
    const percent = Math.min(100, Math.round((cartSubtotal / threshold) * 100));
    return { qualifies, remaining, threshold, percent };
  }, [cartSubtotal, settings.delivery.freeDeliveryThreshold]);

  const recentlyViewed = useMemo(() => {
    return recentlyViewedIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [recentlyViewedIds, products]);

  // Record product view
  const recordProductView = useCallback((productId: string) => {
    setRecentlyViewedIds(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 8);
    });
  }, []);

  // Cart operations
  const addToCart = useCallback((product: Product, quantity = 1, selectedSize?: string, selectedColor?: string): boolean => {
    if (product.stock <= 0) return false;

    const size = selectedSize || (product.sizes.length > 0 ? product.sizes[0] : undefined);
    const color = selectedColor || (product.colors.length > 0 ? product.colors[0] : undefined);
    const cartItemId = `${product.id}-${size || 'nosize'}-${color || 'nocolor'}`;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === cartItemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prevCart.map(item =>
          item.id === cartItemId ? { ...item, quantity: newQty } : item
        );
      }
      const newItem: CartItem = {
        id: cartItemId,
        productId: product.id,
        nameEn: product.nameEn,
        nameBn: product.nameBn,
        image: product.images[0] || '',
        price: product.discountPrice ?? product.regularPrice,
        regularPrice: product.regularPrice,
        quantity: Math.min(quantity, product.stock),
        selectedSize: size,
        selectedColor: color,
        maxStock: product.stock
      };
      return [...prevCart, newItem];
    });
    return true;
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  }, []);

  const updateCartQuantity = useCallback((cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id === cartItemId) {
          const clamped = Math.min(newQuantity, item.maxStock);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  // Wishlist operations
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const moveWishlistToCart = useCallback((productId: string): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return false;
    addToCart(product, 1);
    setWishlist(prev => prev.filter(id => id !== productId));
    return true;
  }, [products, addToCart]);

  const moveAllWishlistToCart = useCallback(() => {
    wishlist.forEach(id => {
      const p = products.find(prod => prod.id === id);
      if (p && p.stock > 0) {
        addToCart(p, 1);
      }
    });
    setWishlist([]);
  }, [wishlist, products, addToCart]);

  // Comparison Tool operations (max 4 products)
  const addToCompare = useCallback((productId: string): { success: boolean; message: string } => {
    if (compareList.includes(productId)) {
      return { success: false, message: 'পণ্যটি ইতিমধ্যে তুলনা তালিকায় যুক্ত আছে।' };
    }
    if (compareList.length >= 4) {
      return { success: false, message: 'একসাথে সর্বোচ্চ ৪টি পণ্য তুলনা করা যাবে।' };
    }
    setCompareList(prev => [...prev, productId]);
    return { success: true, message: 'পণ্যটি তুলনা তালিকায় যুক্ত হয়েছে।' };
  }, [compareList]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList(prev => prev.filter(id => id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback((productId: string) => compareList.includes(productId), [compareList]);

  // Coupons
  const applyCoupon = useCallback((code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }
    if (found.minOrder && cartSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Minimum order of ৳${found.minOrder} required for coupon ${found.code}`
      };
    }
    setAppliedCoupon(found);
    return {
      success: true,
      message: `Coupon ${found.code} applied! Discount: ${found.type === 'percentage' ? found.value + '%' : '৳' + found.value}`
    };
  }, [coupons, cartSubtotal]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  // Place Order with safe stock validation and idempotency
  const placeOrder = useCallback(async (
    orderPayload: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'status'>
  ): Promise<{ success: boolean; orderId: string; orderNumber: string; error?: string }> => {
    // 1. Stock validation check
    for (const item of orderPayload.items) {
      const liveProduct = products.find(p => p.id === item.productId);
      if (!liveProduct) {
        return { success: false, orderId: '', orderNumber: '', error: `Product ${item.nameEn} is no longer available.` };
      }
      if (liveProduct.stock < item.quantity) {
        return { success: false, orderId: '', orderNumber: '', error: `Insufficient stock for ${item.nameEn}. Available: ${liveProduct.stock}` };
      }
    }

    // 2. Generate unique IDs
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PRY-${new Date().getFullYear()}-${randomSuffix}`;
    const orderId = `PRY-ORD-${timestamp}`;

    const newOrder: Order = {
      ...orderPayload,
      id: orderId,
      orderNumber,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // 3. Atomically update stock for ordered items
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const orderedItem = orderPayload.items.find(item => item.productId === p.id);
        if (orderedItem) {
          const updatedStock = Math.max(0, p.stock - orderedItem.quantity);
          return {
            ...p,
            stock: updatedStock,
            status: updatedStock === 0 ? 'out_of_stock' : p.status
          };
        }
        return p;
      })
    );

    // 4. Record order
    setOrders(prev => [newOrder, ...prev]);
    setLatestConfirmedOrder(newOrder);

    // 5. Clear cart
    clearCart();

    return { success: true, orderId, orderNumber };
  }, [products, clearCart]);

  // Order status transition flow (Pending → Confirmed → Processing → Shipped → Delivered / Cancelled)
  const updateOrderStatus = useCallback((
    orderId: string,
    status: OrderStatus,
    courierName?: string,
    trackingNumber?: string
  ) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          // If moving from active to cancelled, restore stock
          if (status === 'cancelled' && order.status !== 'cancelled') {
            setProducts(currentProducts =>
              currentProducts.map(p => {
                const item = order.items.find(i => i.productId === p.id);
                if (item) {
                  return { ...p, stock: p.stock + item.quantity, status: 'active' };
                }
                return p;
              })
            );
          }
          return {
            ...order,
            status,
            courierName: courierName !== undefined ? courierName : order.courierName,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : order.trackingNumber
          };
        }
        return order;
      })
    );
  }, []);

  // Order tracking
  const trackOrder = useCallback((orderQuery: string, phoneQuery?: string): Order | null => {
    const cleanQuery = orderQuery.trim().toUpperCase();
    const cleanPhone = phoneQuery?.trim().replace(/[^0-9]/g, '');

    return orders.find(o => {
      const matchId = o.id.toUpperCase() === cleanQuery || o.orderNumber.toUpperCase() === cleanQuery;
      if (!phoneQuery) return matchId;
      const orderPhone = o.phone.replace(/[^0-9]/g, '');
      return matchId && (orderPhone.endsWith(cleanPhone || '') || (cleanPhone ? orderPhone.includes(cleanPhone) : true));
    }) || null;
  }, [orders]);

  // Purchase Verification helper for Reviews
  const verifyCustomerPurchaseForProduct = useCallback((
    productId: string,
    userId?: string,
    phone?: string
  ): { isVerified: boolean; orderId?: string } => {
    const matchingOrder = orders.find(o => {
      // Must be delivered status for verified purchase badge
      const isDelivered = o.status === 'delivered';
      const hasProduct = o.items.some(i => i.productId === productId);
      const isOwner = (userId && o.userId === userId) || (phone && o.phone.replace(/[^0-9]/g, '').endsWith(phone.replace(/[^0-9]/g, '')));
      return isDelivered && hasProduct && isOwner;
    });

    if (matchingOrder) {
      return { isVerified: true, orderId: matchingOrder.orderNumber || matchingOrder.id };
    }
    return { isVerified: false };
  }, [orders]);

  // Reviews
  const addReview = useCallback((reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    // Check verified purchase dynamically if not explicitly specified
    const purchaseStatus = verifyCustomerPurchaseForProduct(reviewData.productId, reviewData.userId);
    const isVerified = reviewData.verifiedPurchase || purchaseStatus.isVerified;
    const orderId = reviewData.orderId || purchaseStatus.orderId;

    const newReview: Review = {
      ...reviewData,
      id: 'REV-' + Date.now(),
      verifiedPurchase: isVerified,
      orderId,
      status: reviewData.status || 'approved',
      category: reviewData.category || 'general',
      helpfulCount: reviewData.helpfulCount || 0,
      votedUserIds: reviewData.votedUserIds || [],
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);

    // Update product rating average
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if (p.id === reviewData.productId) {
          const prodReviews = reviews.filter(r => r.productId === p.id && r.status !== 'rejected');
          const totalRating = prodReviews.reduce((acc, r) => acc + r.rating, 0) + reviewData.rating;
          const newCount = prodReviews.length + 1;
          const avg = Number((totalRating / newCount).toFixed(1));
          return { ...p, rating: avg, reviewCount: newCount };
        }
        return p;
      })
    );
  }, [reviews, verifyCustomerPurchaseForProduct]);

  const getProductReviews = useCallback((productId: string, includeUnapproved = false) => {
    return reviews.filter(r => {
      if (r.productId !== productId) return false;
      if (includeUnapproved) return true;
      return r.status === 'approved' || !r.status;
    });
  }, [reviews]);

  const toggleHelpfulReview = useCallback((reviewId: string, userId = 'ANON_USER') => {
    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          const voters = r.votedUserIds || [];
          const hasVoted = voters.includes(userId);
          const newVoters = hasVoted ? voters.filter(id => id !== userId) : [...voters, userId];
          const newCount = hasVoted ? Math.max(0, (r.helpfulCount || 1) - 1) : (r.helpfulCount || 0) + 1;
          return {
            ...r,
            helpfulCount: newCount,
            votedUserIds: newVoters
          };
        }
        return r;
      })
    );
  }, []);

  const moderateReview = useCallback((
    reviewId: string,
    status: Review['status'],
    adminResponse?: Review['adminResponse']
  ) => {
    setReviews(prev =>
      prev.map(r => {
        if (r.id === reviewId) {
          return {
            ...r,
            status: status || r.status,
            adminResponse: adminResponse || r.adminResponse
          };
        }
        return r;
      })
    );
  }, []);

  // Claim guest orders upon customer registration
  const claimGuestOrder = useCallback((
    orderNumber: string,
    phone: string,
    userId: string
  ): { success: boolean; message: string; count?: number } => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let matchedCount = 0;

    setOrders(prev =>
      prev.map(order => {
        const orderPhone = order.phone.replace(/[^0-9]/g, '');
        const phoneMatch = cleanPhone && (orderPhone.endsWith(cleanPhone) || cleanPhone.endsWith(orderPhone));
        const numMatch = orderNumber && (order.orderNumber.toUpperCase() === orderNumber.toUpperCase() || order.id.toUpperCase() === orderNumber.toUpperCase());

        if ((phoneMatch || numMatch) && (!order.userId || order.userId === 'USR-GUEST')) {
          matchedCount++;
          return { ...order, userId };
        }
        return order;
      })
    );

    if (matchedCount > 0) {
      return { success: true, message: `${matchedCount}টি অতীত অর্ডার আপনার অ্যাকাউন্টে সফলভাবে লিঙ্ক করা হয়েছে!`, count: matchedCount };
    }
    return { success: false, message: 'প্রদত্ত ফোন নম্বর বা অর্ডার নম্বরের সাথে মিলযুক্ত কোনো গেস্ট অর্ডার পাওয়া যায়নি।' };
  }, []);

  // Admin operations: Products
  const addProduct = useCallback((newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: 'PRY-' + Math.floor(2000 + Math.random() * 8000),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const resetDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setCoupons(INITIAL_COUPONS);
    setBanners(INITIAL_BANNERS);
    setReviews(INITIAL_REVIEWS);
    setSettings(INITIAL_STORE_SETTINGS);
  }, []);

  const clearDemoData = useCallback(() => {
    setProducts(prev => prev.filter(p => !p.isDemo));
    setOrders(prev => prev.filter(o => !o.isDemo));
  }, []);

  // Admin operations: Categories
  const addCategory = useCallback((category: Category) => {
    setCategories(prev => [...prev, category]);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // Admin operations: Banners
  const addBanner = useCallback((banner: Banner) => {
    setBanners(prev => [...prev, banner]);
  }, []);

  const updateBanner = useCallback((id: string, updates: Partial<Banner>) => {
    setBanners(prev => prev.map(b => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const deleteBanner = useCallback((id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  }, []);

  // Admin operations: Coupons
  const addCoupon = useCallback((coupon: Coupon) => {
    setCoupons(prev => [...prev, coupon]);
  }, []);

  const updateCoupon = useCallback((code: string, updates: Partial<Coupon>) => {
    setCoupons(prev => prev.map(c => (c.code === code ? { ...c, ...updates } : c)));
  }, []);

  const deleteCoupon = useCallback((code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
  }, []);

  // Admin operations: Settings
  const updateDeliverySettings = useCallback((delivery: Partial<DeliverySettings>) => {
    setSettings(prev => ({ ...prev, delivery: { ...prev.delivery, ...delivery } }));
  }, []);

  const updatePaymentSettings = useCallback((payment: Partial<PaymentSettings>) => {
    setSettings(prev => ({ ...prev, payment: { ...prev.payment, ...payment } }));
  }, []);

  // Newsletter Subscribers & Customer Database operations
  const subscribeNewsletter = useCallback((email: string, name?: string, phone?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = newsletterSubscribers.find(s => s.email.toLowerCase() === cleanEmail);
    const welcomeCoupon = 'WELCOME10';

    if (existing) {
      return {
        success: true,
        isNew: false,
        couponCode: existing.couponCode || welcomeCoupon,
        message: 'আপনি ইতিমধ্যে আমাদের নিবন্ধিত ভিআইপি মেম্বার! আপনার ১০% ছাড়ের কোডটি সক্রিয় রয়েছে।'
      };
    }

    const newSubscriber: NewsletterSubscriber = {
      id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      email: cleanEmail,
      name: name ? name.trim() : undefined,
      phone: phone ? phone.trim() : undefined,
      couponCode: welcomeCoupon,
      source: 'Main Page Newsletter Section',
      subscribedAt: new Date().toISOString(),
      status: 'active'
    };

    setNewsletterSubscribers(prev => [newSubscriber, ...prev]);

    return {
      success: true,
      isNew: true,
      couponCode: welcomeCoupon,
      message: 'অভিনন্দন! প্রেয়সী শপ ভিআইপি ক্লাবে যুক্ত হওয়ার জন্য ধন্যবাদ। আপনার ১০% ডিসকাউন্ট কোড আনলক হয়েছে।'
    };
  }, [newsletterSubscribers]);

  const deleteNewsletterSubscriber = useCallback((id: string) => {
    setNewsletterSubscribers(prev => prev.filter(s => s.id !== id));
  }, []);

  // Price Drop Alerts operations
  const savePriceDropAlert = useCallback((alertData: Omit<PriceDropAlert, 'id' | 'createdAt' | 'status'>) => {
    const alertId = `PDA-${Date.now().toString(36).toUpperCase()}`;
    const newAlert: PriceDropAlert = {
      ...alertData,
      id: alertId,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setPriceDropAlerts(prev => {
      // If user already had an alert for this product, update it
      const filtered = prev.filter(a => !(a.productId === alertData.productId && a.userId === alertData.userId));
      return [newAlert, ...filtered];
    });

    return {
      success: true,
      message: `টার্গেট মূল্য ৳${alertData.targetPrice.toLocaleString()} সফলভাবে সেট করা হয়েছে! দাম কমলেই আপনাকে জানানো হবে।`,
      alertId
    };
  }, []);

  const removePriceDropAlert = useCallback((alertId: string) => {
    setPriceDropAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const getUserPriceAlertForProduct = useCallback((productId: string, userId?: string) => {
    if (!userId) return undefined;
    return priceDropAlerts.find(a => a.productId === productId && a.userId === userId && a.status === 'active');
  }, [priceDropAlerts]);

  return (


    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        coupons,
        reviews,
        settings,
        recentlyViewed,
        cart,
        wishlist,
        appliedCoupon,
        cartCount,
        cartSubtotal,
        cartDiscount,
        freeShippingProgress,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        moveWishlistToCart,
        moveAllWishlistToCart,
        isWishlistOpen,
        setIsWishlistOpen,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        applyCoupon,
        removeCoupon,
        orders,
        placeOrder,
        updateOrderStatus,
        trackOrder,
        addReview,
        getProductReviews,
        toggleHelpfulReview,
        moderateReview,
        verifyCustomerPurchaseForProduct,
        claimGuestOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        resetDemoData,
        clearDemoData,
        addBanner,
        updateBanner,
        deleteBanner,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        updateDeliverySettings,
        updatePaymentSettings,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        currentView,
        setCurrentView,
        selectedProductId,
        setSelectedProductId,
        quickViewProduct,
        setQuickViewProduct,
        isCartOpen,
        setIsCartOpen,
        isAuthOpen,
        setIsAuthOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        isProfileOpen,
        setIsProfileOpen,
        activePolicyModal,
        setActivePolicyModal,
        latestConfirmedOrder,
        setLatestConfirmedOrder,
        recordProductView,
        isChatOpen,
        setIsChatOpen,
        isARModalOpen,
        setIsARModalOpen,
        arProduct,
        setArProduct,
        openARTryOn,
        closeARTryOn,
        newsletterSubscribers,
        subscribeNewsletter,
        deleteNewsletterSubscriber,
        priceDropAlerts,
        savePriceDropAlert,
        removePriceDropAlert,
        getUserPriceAlertForProduct
      }}


    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
