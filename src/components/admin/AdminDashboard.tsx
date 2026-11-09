import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, Package, ShoppingCart, Users, DollarSign,
  TrendingUp, Plus, Edit2, Trash2, CheckCircle, Clock, Truck,
  AlertTriangle, Settings, Tag, Image as ImageIcon, Printer,
  RefreshCw, Database, ExternalLink, Filter, Search, X,
  Mail, Download, UserCheck, Copy, Check, Bot
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Order, OrderStatus, Product, Category, Coupon, Banner, NewsletterSubscriber } from '../../types';
import { InvoiceView } from '../orders/InvoiceView';
import { isFirebaseConfigured, firebaseConfig } from '../../services/firebase';
import { AdminAISettings } from './AdminAISettings';
import { StaffManagementView } from './StaffManagementView';
import { ReviewModerationView } from './ReviewModerationView';
import { FinancialReportView } from './FinancialReportView';
import { InventoryManagementView } from './InventoryManagementView';
import { AuditLogsView } from './AuditLogsView';
import { SUPER_ADMIN_EMAIL, ROLE_LABELS } from '../../services/staffService';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    orders,
    coupons,
    banners,
    settings,
    newsletterSubscribers,
    deleteNewsletterSubscriber,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    addCoupon,
    deleteCoupon,
    updateDeliverySettings,
    updatePaymentSettings,
    resetDemoData,
    clearDemoData,
    setCurrentView
  } = useStore();

  const { currentUser, isSuperAdmin, hasPermission, loginAsAdmin } = useAuth();

  // Active Admin Tabs across 12 Enterprise Modules
  type AdminTab =
    | 'overview'
    | 'orders'
    | 'inventory'
    | 'products'
    | 'categories'
    | 'staff'
    | 'reviews'
    | 'finance'
    | 'coupons'
    | 'subscribers'
    | 'ai'
    | 'settings'
    | 'audit';

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Subscriber filters and copy state
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Order filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);


  // Status update modal state
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodNameBn, setProdNameBn] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodCategory, setProdCategory] = useState('saree');
  const [prodPrice, setProdPrice] = useState(2500);
  const [prodDiscountPrice, setProdDiscountPrice] = useState<number | undefined>(undefined);
  const [prodStock, setProdStock] = useState(10);
  const [prodDesc, setProdDesc] = useState('');
  const [prodImages, setProdImages] = useState('');
  const [prodSizes, setProdSizes] = useState('');
  const [prodColors, setProdColors] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(true);

  // Category Add State
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameBn, setNewCatNameBn] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // Coupon Add State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(1000);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Delivery settings edit state
  const [insideDhaka, setInsideDhaka] = useState(settings.delivery.insideDhakaCharge);
  const [outsideDhaka, setOutsideDhaka] = useState(settings.delivery.outsideDhakaCharge);
  const [ownDelivery, setOwnDelivery] = useState(settings.delivery.ownDeliveryCharge);
  const [freeThreshold, setFreeThreshold] = useState(settings.delivery.freeDeliveryThreshold);

  // Payment settings state
  const [bkashNum, setBkashNum] = useState(settings.payment.bkashNumber);
  const [nagadNum, setNagadNum] = useState(settings.payment.nagadNumber);
  const [rocketNum, setRocketNum] = useState(settings.payment.rocketNumber);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Overview calculations (Distinguish real vs demo transactions per requirements)
  const realOrders = useMemo(() => orders.filter(o => !o.isDemo), [orders]);
  const demoOrders = useMemo(() => orders.filter(o => o.isDemo), [orders]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.grandTotal, 0);

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const shippedCount = orders.filter(o => o.status === 'shipped').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    return {
      totalOrders,
      totalRevenue,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      totalProducts: products.length,
      demoProductsCount: products.filter(p => p.isDemo).length
    };
  }, [orders, products]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchId = o.orderNumber.toLowerCase().includes(q);
        const matchPhone = o.phone.includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        if (!matchId && !matchPhone && !matchName) return false;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Open status modal
  const handleOpenStatusModal = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setCourierName(order.courierName || 'Steadfast Courier');
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    updateOrderStatus(editingOrder.id, newStatus, courierName.trim() || undefined, trackingNumber.trim() || undefined);
    setEditingOrder(null);
  };

  // Open Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdNameEn('');
    setProdNameBn('');
    setProdSku(`PRY-SKU-${Math.floor(100 + Math.random() * 900)}`);
    setProdCategory(categories[0]?.id || 'saree');
    setProdPrice(3500);
    setProdDiscountPrice(undefined);
    setProdStock(12);
    setProdDesc('');
    setProdImages('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80');
    setProdSizes('Standard Size');
    setProdColors('Maroon, Gold');
    setProdIsFeatured(false);
    setProdIsNew(true);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdNameEn(prod.nameEn);
    setProdNameBn(prod.nameBn);
    setProdSku(prod.sku);
    setProdCategory(prod.categoryId);
    setProdPrice(prod.regularPrice);
    setProdDiscountPrice(prod.discountPrice);
    setProdStock(prod.stock);
    setProdDesc(prod.description);
    setProdImages(prod.images.join(', '));
    setProdSizes(prod.sizes.join(', '));
    setProdColors(prod.colors.join(', '));
    setProdIsFeatured(prod.isFeatured);
    setProdIsNew(prod.isNewArrival);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const imgs = prodImages.split(',').map(s => s.trim()).filter(Boolean);
    const szs = prodSizes.split(',').map(s => s.trim()).filter(Boolean);
    const cls = prodColors.split(',').map(s => s.trim()).filter(Boolean);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        nameEn: prodNameEn.trim(),
        nameBn: prodNameBn.trim(),
        sku: prodSku.trim(),
        categoryId: prodCategory,
        regularPrice: Number(prodPrice),
        discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : undefined,
        stock: Number(prodStock),
        description: prodDesc.trim(),
        images: imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
        sizes: szs,
        colors: cls,
        isFeatured: prodIsFeatured,
        isNewArrival: prodIsNew,
        status: Number(prodStock) <= 0 ? 'out_of_stock' : 'active'
      });
    } else {
      addProduct({
        nameEn: prodNameEn.trim(),
        nameBn: prodNameBn.trim(),
        sku: prodSku.trim(),
        categoryId: prodCategory,
        regularPrice: Number(prodPrice),
        discountPrice: prodDiscountPrice ? Number(prodDiscountPrice) : undefined,
        stock: Number(prodStock),
        description: prodDesc.trim(),
        images: imgs.length > 0 ? imgs : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
        sizes: szs,
        colors: cls,
        isFeatured: prodIsFeatured,
        isNewArrival: prodIsNew,
        isBestSeller: false,
        isDemo: false,
        status: Number(prodStock) <= 0 ? 'out_of_stock' : 'active',
        rating: 5.0,
        reviewCount: 0
      });
    }
    setIsProductModalOpen(false);
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameEn.trim() || !newCatNameBn.trim()) return;
    const catId = newCatNameEn.toLowerCase().replace(/[^a-z0-9]/g, '-');
    addCategory({
      id: catId,
      nameEn: newCatNameEn.trim(),
      nameBn: newCatNameBn.trim(),
      image: newCatImage.trim() || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      itemCount: 0
    });
    setNewCatNameEn('');
    setNewCatNameBn('');
    setNewCatImage('');
  };

  // Add Coupon Handler
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: Number(newCouponValue),
      minOrder: Number(newCouponMin),
      description: newCouponDesc.trim() || `${newCouponCode} voucher`,
      isActive: true
    });
    setNewCouponCode('');
    setNewCouponDesc('');
  };

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    const q = subscriberSearchQuery.trim().toLowerCase();
    if (!q) return newsletterSubscribers;
    return newsletterSubscribers.filter(s =>
      s.email.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      s.couponCode.toLowerCase().includes(q)
    );
  }, [newsletterSubscribers, subscriberSearchQuery]);

  // CSV Export for newsletter database
  const handleExportSubscribersCSV = () => {
    if (newsletterSubscribers.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Coupon Code', 'Source', 'Subscribed At', 'Status'];
    const rows = newsletterSubscribers.map(s => [
      `"${s.id}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.phone || ''}"`,
      `"${s.couponCode}"`,
      `"${s.source}"`,
      `"${s.subscribedAt}"`,
      `"${s.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `preyoshi_customers_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeliverySettings({
      insideDhakaCharge: Number(insideDhaka),
      outsideDhakaCharge: Number(outsideDhaka),
      ownDeliveryCharge: Number(ownDelivery),
      freeDeliveryThreshold: Number(freeThreshold)
    });
    updatePaymentSettings({
      bkashNumber: bkashNum.trim(),
      nagadNumber: nagadNum.trim(),
      rocketNumber: rocketNum.trim()
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      {/* 1. Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#BE0750] uppercase tracking-wider font-serif-brand">
            <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
            <span>PREYOSHI SHOP কন্ট্রোল প্যানেল</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-[#2A101A]">
              অ্যাডমিন ড্যাশবোর্ড ও শপ ম্যানেজমেন্ট
            </h1>
            {isSuperAdmin ? (
              <span className="bg-[#7A1238] text-[#F6E2B3] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#D9A441] flex items-center gap-1 shadow-2xs">
                <span>👑 Sole Super Admin</span>
                <span className="text-[10px] text-emerald-300">• Verified & MFA Active</span>
              </span>
            ) : currentUser?.role && currentUser.role !== 'customer' ? (
              <span className="bg-gray-800 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-gray-600">
                {ROLE_LABELS[currentUser.role]?.en || currentUser.role}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('store')}
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-[#F8E8E9] hover:text-[#7A1238] text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            স্টোরে ফিরে যান
          </button>
        </div>
      </div>

      {/* 2. Admin Navigation Tabs (Role & Permission Gated) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-4 border-b border-gray-200 no-scrollbar text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ওভারভিউ (Overview)
        </button>

        {(hasPermission('orders.read') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>অর্ডার</span>
            {stats.pendingCount > 0 && (
              <span className="bg-[#BE0750] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {stats.pendingCount}
              </span>
            )}
          </button>
        )}

        {(hasPermission('inventory.read') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
              activeTab === 'inventory' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ইনভেন্টরি ও স্টক
          </button>
        )}

        {(hasPermission('products.read') || isSuperAdmin) && (
          <>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
                activeTab === 'products' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              পণ্য তালিকা ({stats.totalProducts})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
                activeTab === 'categories' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ক্যাটাগরি সমূহ
            </button>
          </>
        )}

        {(hasPermission('staff.read') || hasPermission('staff.manage') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'staff' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>স্টাফ ও রোল</span>
          </button>
        )}

        {(hasPermission('reviews.moderate') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>রিভিউ মডারেশন</span>
          </button>
        )}

        {(hasPermission('finance.read') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'finance' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>আর্থিক হিসাব</span>
          </button>
        )}

        {(hasPermission('products.read') || hasPermission('settings.manage') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
              activeTab === 'coupons' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            কুপন ও ছাড়
          </button>
        )}

        {(hasPermission('customers.read') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'subscribers' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>গ্রাহক ডাটাবেস ({newsletterSubscribers.length})</span>
          </button>
        )}

        {(hasPermission('settings.manage') || isSuperAdmin) && (
          <>
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-[#D9A441]" />
              <span>AI সেটিংস</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ডেলিভারি সেটিংস
            </button>
          </>
        )}

        {(hasPermission('staff.read') || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-2 rounded-xl shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit' ? 'bg-[#7A1238] text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>অডিট লগ</span>
          </button>
        )}
      </div>

      {/* 3. TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="py-6 space-y-8 animate-fade-in">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold font-bangla">মোট অর্ডার</span>
                <ShoppingCart className="w-5 h-5 text-[#7A1238]" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">{stats.totalOrders}</h3>
              <p className="text-[11px] text-gray-400 mt-1">
                {realOrders.length} রিয়েল · {demoOrders.length} ডেমো
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold font-bangla">মোট অর্জিত রেভিনিউ</span>
                <DollarSign className="w-5 h-5 text-[#D9A441]" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#7A1238]">৳{stats.totalRevenue.toLocaleString()}</h3>
              <p className="text-[11px] text-gray-400 mt-1 font-bangla">সফল ও অ্যাক্টিভ অর্ডার</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold font-bangla">অপেক্ষমাণ (Pending)</span>
                <Clock className="w-5 h-5 text-[#BE0750]" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#BE0750]">{stats.pendingCount}</h3>
              <p className="text-[11px] text-gray-400 mt-1 font-bangla">কনফার্মেশনের অপেক্ষায়</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold font-bangla">ডেলিভারি সম্পন্ন</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-700">{stats.deliveredCount}</h3>
              <p className="text-[11px] text-gray-400 mt-1 font-bangla">সফলভাবে হস্তান্তরিত</p>
            </div>

            <div
              onClick={() => setActiveTab('subscribers')}
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs cursor-pointer hover:border-[#D9A441] transition-colors group"
            >
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold font-bangla">কাস্টমার ডাটাবেস</span>
                <Mail className="w-5 h-5 text-[#7A1238] group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#7A1238]">{newsletterSubscribers.length}</h3>
              <p className="text-[11px] text-gray-400 mt-1 font-bangla">নিউজলেটার সাবস্ক্রাইবার</p>
            </div>
          </div>


          {/* Order Status Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="text-base font-bold font-bangla text-gray-900">
              অর্ডার স্ট্যাটাস পাইপলাইন
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <span className="text-[11px] text-amber-700 font-bold block font-bangla">পেন্ডিং</span>
                <strong className="text-lg text-amber-900">{stats.pendingCount}</strong>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <span className="text-[11px] text-blue-700 font-bold block font-bangla">কনফার্মড</span>
                <strong className="text-lg text-blue-900">{stats.confirmedCount}</strong>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-center">
                <span className="text-[11px] text-purple-700 font-bold block font-bangla">প্রসেসিং</span>
                <strong className="text-lg text-purple-900">{stats.processingCount}</strong>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                <span className="text-[11px] text-indigo-700 font-bold block font-bangla">শিপড</span>
                <strong className="text-lg text-indigo-900">{stats.shippedCount}</strong>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <span className="text-[11px] text-emerald-700 font-bold block font-bangla">ডেলিভার্ড</span>
                <strong className="text-lg text-emerald-900">{stats.deliveredCount}</strong>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-center">
                <span className="text-[11px] text-red-700 font-bold block font-bangla">বাতিল</span>
                <strong className="text-lg text-red-900">{stats.cancelledCount}</strong>
              </div>
            </div>
          </div>

          {/* Demo Data Management Notice */}
          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider font-serif-brand">
                  DEMO DATA MANAGEMENT
                </h4>
              </div>
              <p className="text-xs text-amber-800 font-bangla max-w-2xl leading-relaxed">
                অ্যাপ্লিকেশনটিতে প্রদর্শিত নমুনা পণ্য ও টেস্ট অর্ডারগুলো শুধুমাত্র ফাংশনালিটি যাচাই করার জন্য রাখা হয়েছে।
                প্রয়োজনে এক ক্লিকে ডেমো ডেটা মুছে ফেলে আপনার আসল পণ্যের স্টক যুক্ত করতে পারেন।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clearDemoData}
                className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer"
              >
                ডেমো ডেটা মুছুন
              </button>
              <button
                onClick={resetDemoData}
                className="px-3.5 py-2 rounded-xl bg-[#7A1238] text-white hover:bg-[#BE0750] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>রিসেট ডেমো ডেটা</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="py-6 space-y-6 animate-fade-in">
          {/* Order Search & Status Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                placeholder="অর্ডার আইডি, ফোন বা নাম সার্চ করুন..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-gray-500 text-[11px] font-medium shrink-0 font-bangla">ফিল্টার:</span>
              {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg uppercase tracking-wider font-semibold text-[11px] shrink-0 transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-[#7A1238] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">অর্ডার নং</th>
                    <th className="p-4">গ্রাহকের নাম ও ফোন</th>
                    <th className="p-4">পণ্য তালিকা</th>
                    <th className="p-4">ডেলিভারি ঠিকানা</th>
                    <th className="p-4 text-right">বিল (BDT)</th>
                    <th className="p-4 text-center">পেমেন্ট</th>
                    <th className="p-4 text-center">স্ট্যাটাস</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400 font-bangla">
                        কোনো অর্ডার পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-gray-900">
                          {order.orderNumber}
                          {order.isDemo && (
                            <span className="block text-[9px] text-amber-700 font-sans font-semibold">
                              DEMO
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <strong className="block text-gray-900">{order.customerName}</strong>
                          <span className="text-gray-500 font-mono">{order.phone}</span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="space-y-0.5 truncate font-bangla text-gray-700">
                            {order.items.map((it, i) => (
                              <div key={i} className="truncate">
                                {it.nameBn} (x{it.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 max-w-xs truncate font-bangla">
                          {order.deliveryAddress}, {order.district}
                        </td>
                        <td className="p-4 text-right font-extrabold text-[#7A1238]">
                          ৳{order.grandTotal.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800">
                            {order.paymentMethod}
                          </span>
                          {order.transactionId && (
                            <span className="block text-[9px] font-mono text-gray-400 mt-0.5 truncate max-w-[80px]">
                              {order.transactionId}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : order.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'shipped'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenStatusModal(order)}
                              className="px-2.5 py-1 rounded-lg bg-[#7A1238] hover:bg-[#BE0750] text-white text-[11px] font-bold transition-colors cursor-pointer"
                              title="Update Status & Courier"
                            >
                              স্ট্যাটাস
                            </button>
                            <button
                              onClick={() => setSelectedInvoiceOrder(order)}
                              className="p-1 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100"
                              title="Print Invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="py-6 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-bangla text-gray-900">
              সকল পণ্য ও স্টক নিয়ন্ত্রণ ({products.length})
            </h3>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন পণ্য যুক্ত করুন</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">ছবি</th>
                    <th className="p-4">পণ্যের নাম (বাংলা / ইংরেজি)</th>
                    <th className="p-4">ক্যাটাগরি</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4 text-right">নিয়মিত মূল্য</th>
                    <th className="p-4 text-right">অফার মূল্য</th>
                    <th className="p-4 text-center">স্টক</th>
                    <th className="p-4 text-center">স্ট্যাটাস</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <img
                          src={p.images[0]}
                          alt={p.nameEn}
                          className="w-12 h-14 object-cover rounded-lg border border-gray-100"
                        />
                      </td>
                      <td className="p-4 max-w-xs">
                        <strong className="block text-gray-900 font-bangla truncate">{p.nameBn}</strong>
                        <span className="text-[11px] text-gray-500 truncate block">{p.nameEn}</span>
                        {p.isDemo && (
                          <span className="text-[9px] text-amber-800 font-semibold bg-amber-50 px-1 rounded-sm">
                            DEMO
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-gray-600 uppercase font-medium">{p.categoryId}</td>
                      <td className="p-4 font-mono text-gray-500">{p.sku}</td>
                      <td className="p-4 text-right font-medium">৳{p.regularPrice.toLocaleString()}</td>
                      <td className="p-4 text-right font-bold text-[#7A1238]">
                        {p.discountPrice ? `৳${p.discountPrice.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            p.stock <= 0
                              ? 'bg-red-100 text-red-700'
                              : p.stock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.nameEn}?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="py-6 space-y-6 animate-fade-in">
          {/* Add Category Form */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs">
            <h3 className="text-sm font-bold font-bangla text-gray-900 mb-3">
              নতুন ক্যাটাগরি যুক্ত করুন
            </h3>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <input
                  type="text"
                  required
                  value={newCatNameBn}
                  onChange={e => setNewCatNameBn(e.target.value)}
                  placeholder="বাংলা নাম (e.g. লেহেঙ্গা)"
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  value={newCatNameEn}
                  onChange={e => setNewCatNameEn(e.target.value)}
                  placeholder="ইংরেজি নাম (e.g. Lehenga)"
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newCatImage}
                  onChange={e => setNewCatImage(e.target.value)}
                  placeholder="ছবি URL (ঐচ্ছিক)"
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="py-2 px-4 bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ক্যাটাগরি যুক্ত করুন
              </button>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <div
                key={cat.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <img
                    src={cat.image}
                    alt={cat.nameEn}
                    className="w-full aspect-square object-cover rounded-xl mb-2"
                  />
                  <h4 className="font-bold text-xs font-bangla text-gray-900">{cat.nameBn}</h4>
                  <p className="text-[10px] text-gray-500 font-medium">{cat.nameEn}</p>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-400">{cat.itemCount || 0} টি পণ্য</span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete category ${cat.nameEn}?`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="py-6 space-y-6 animate-fade-in">
          {/* Add Coupon Form */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-2xs">
            <h3 className="text-sm font-bold font-bangla text-gray-900 mb-3">
              নতুন ডিসকাউন্ট কুপন তৈরি করুন
            </h3>
            <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">কুপন কোড:</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={e => setNewCouponCode(e.target.value)}
                  placeholder="e.g. EID2026"
                  className="w-full px-3 py-2 border rounded-xl uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">ডিসকাউন্ট ধরন:</label>
                <select
                  value={newCouponType}
                  onChange={e => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="percentage">শতকরা (%) Percentage</option>
                  <option value="fixed">স্থির ছাড় (Fixed ৳ BDT)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">মূল্য / পরিমাণ:</label>
                <input
                  type="number"
                  required
                  value={newCouponValue}
                  onChange={e => setNewCouponValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">সর্বনিম্ন অর্ডার (৳):</label>
                <input
                  type="number"
                  value={newCouponMin}
                  onChange={e => setNewCouponMin(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div className="sm:self-end">
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  কুপন সেভ করুন
                </button>
              </div>
            </form>
          </div>

          {/* Coupon List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {coupons.map(c => (
              <div
                key={c.code}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-sm text-[#7A1238] bg-[#F8E8E9] px-2.5 py-1 rounded-lg">
                    {c.code}
                  </span>
                  <button
                    onClick={() => deleteCoupon(c.code)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-600 leading-snug">{c.description}</p>
                <div className="text-[11px] text-gray-500 font-medium pt-2 border-t border-gray-100 flex justify-between">
                  <span>ছাড়: {c.type === 'percentage' ? `${c.value}%` : `৳${c.value}`}</span>
                  <span>মিনিমাম অর্ডার: ৳{c.minOrder || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TAB: AI ASSISTANT SETTINGS */}
      {activeTab === 'ai' && (
        <div className="py-6 animate-fade-in">
          <AdminAISettings />
        </div>
      )}

      {/* 9. TAB: SETTINGS & FIREBASE STATUS */}
      {activeTab === 'settings' && (
        <div className="py-6 space-y-8 animate-fade-in">
          {/* Delivery & Payment Settings Form */}
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-6">
            <h3 className="text-base font-bold font-bangla text-gray-900 border-b border-gray-100 pb-3">
              ডেলিভারি চার্জ ও পেমেন্ট গেটওয়ে কনফিগারেশন
            </h3>

            {settingsSaved && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bangla flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>সকল সেটিংস সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                  ঢাকা সিটির মধ্যে ডেলিভারি চার্জ (৳):
                </label>
                <input
                  type="number"
                  value={insideDhaka}
                  onChange={e => setInsideDhaka(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                  ঢাকার বাইরে ডেলিভারি চার্জ (৳):
                </label>
                <input
                  type="number"
                  value={outsideDhaka}
                  onChange={e => setOutsideDhaka(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                  নিজস্ব রাইডার ডেলিভারি চার্জ (৳):
                </label>
                <input
                  type="number"
                  value={ownDelivery}
                  onChange={e => setOwnDelivery(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                  ফ্রি ডেলিভারির সর্বনিম্ন অর্ডার (৳):
                </label>
                <input
                  type="number"
                  value={freeThreshold}
                  onChange={e => setFreeThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-gray-100">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  bKash (বিকাশ) নম্বর:
                </label>
                <input
                  type="text"
                  value={bkashNum}
                  onChange={e => setBkashNum(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Nagad (নগদ) নম্বর:
                </label>
                <input
                  type="text"
                  value={nagadNum}
                  onChange={e => setNagadNum(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Rocket (রকেট) নম্বর:
                </label>
                <input
                  type="text"
                  value={rocketNum}
                  onChange={e => setRocketNum(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              সেটিংস সংরক্ষণ করুন
            </button>
          </form>

          {/* Firebase Backend Cloud Firestore Status & Setup Guide */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-[#7A1238]" />
                <h3 className="font-bold font-bangla text-base text-gray-900">
                  ক্লাউড ফায়ারবেস (Firebase Backend) ইন্টিগ্রেশন স্ট্যাটাস
                </h3>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isFirebaseConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {isFirebaseConfigured ? 'Firebase Connected' : 'Local Persistent Storage Mode'}
              </span>
            </div>

            <p className="text-xs text-gray-600 font-bangla leading-relaxed">
              {isFirebaseConfigured
                ? `Firebase Firestore এবং Auth সফলভাবে সংযুক্ত রয়েছে (Project ID: ${firebaseConfig.projectId})। সমস্ত ডেটা সরাসরি ক্লাউডে রিয়েল-টাইমে সেভ হচ্ছে।`
                : 'বর্তমানে সিস্টেমটি হাই-পারফরম্যান্স অফলাইন-ফার্স্ট ব্রাউজার স্টোরেজে নিরবচ্ছিন্নভাবে কাজ করছে। রিয়েল ক্লাউড ফায়ারবেস ডেটাবেস যুক্ত করতে নিচের ভ্যারিয়েবলগুলো .env ফাইলে প্রদান করুন:'}
            </p>

            <div className="bg-[#2A101A] text-[#F6E2B3] p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-1">
              <p># PREYOSHI SHOP Firebase Configuration (.env)</p>
              <p>VITE_FIREBASE_API_KEY="your-api-key"</p>
              <p>VITE_FIREBASE_AUTH_DOMAIN="preyoshi-shop.firebaseapp.com"</p>
              <p>VITE_FIREBASE_PROJECT_ID="preyoshi-shop"</p>
              <p>VITE_FIREBASE_STORAGE_BUCKET="preyoshi-shop.firebasestorage.app"</p>
              <p>VITE_FIREBASE_MESSAGING_SENDER_ID="1234567890"</p>
              <p>VITE_FIREBASE_APP_ID="1:1234567890:web:abcdef"</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB: NEWSLETTER SUBSCRIBERS & CUSTOMER DATABASE */}
      {activeTab === 'subscribers' && (
        <div className="py-6 space-y-6 animate-fade-in">
          {/* Header & Export Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#7A1238]" />
                <h3 className="text-lg font-bold font-bangla text-gray-900">
                  নিউজলেটার গ্রাহক ডাটাবেস (Customer Database & Leads)
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-bangla mt-1 max-w-xl">
                ওয়েবসাইটের নিউজলেটার সাইনআপ ফর্ম থেকে সংগৃহীত গ্রাহকদের তালিকা। ইমেইল ক্যাম্পেইন, বাল্ক এসএমএস বা সিআরএম (CRM) টুলে ব্যবহারের জন্য সরাসরি সিএসভি ফাইলে ডাউনলোড করুন।
              </p>
            </div>

            <button
              onClick={handleExportSubscribersCSV}
              disabled={newsletterSubscribers.length === 0}
              className="py-2.5 px-4 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-bold font-bangla transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4 text-[#D9A441]" />
              <span>গ্রাহক তালিকা ডাউনলোড (CSV)</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <span className="text-xs text-gray-500 font-bangla block">মোট গ্রাহক ডেটাবেস</span>
              <strong className="text-2xl text-[#7A1238] font-black">{newsletterSubscribers.length} জন</strong>
              <p className="text-[11px] text-gray-400 mt-0.5">নিবন্ধনকৃত মোট গ্রাহক</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <span className="text-xs text-gray-500 font-bangla block">সক্রিয় সাবস্ক্রাইবার</span>
              <strong className="text-2xl text-emerald-700 font-black">
                {newsletterSubscribers.filter(s => s.status === 'active').length} জন
              </strong>
              <p className="text-[11px] text-gray-400 mt-0.5">প্রোমো ইমেইল পাওয়ার জন্য প্রস্তুত</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs">
              <span className="text-xs text-gray-500 font-bangla block">ইস্যুকৃত স্বাগতম কুপন</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-1 rounded-lg bg-pink-100 text-[#7A1238] font-mono font-extrabold text-sm border border-pink-200">
                  WELCOME10
                </span>
                <span className="text-xs font-bold text-gray-600 font-bangla">১০% ফ্ল্যাট ছাড়</span>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="relative">
              <input
                type="text"
                value={subscriberSearchQuery}
                onChange={e => setSubscriberSearchQuery(e.target.value)}
                placeholder="ইমেইল, নাম, মোবাইল নম্বর বা কুপন কোড লিখে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#7A1238] focus:bg-white transition-all font-bangla"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {subscriberSearchQuery && (
                <button
                  onClick={() => setSubscriberSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-bangla border-b border-gray-100">
                    <th className="py-3 px-4 font-bold">গ্রাহক</th>
                    <th className="py-3 px-4 font-bold">ইমেইল ঠিকানা</th>
                    <th className="py-3 px-4 font-bold">মোবাইল নম্বর</th>
                    <th className="py-3 px-4 font-bold">উৎস (Source)</th>
                    <th className="py-3 px-4 font-bold">তারিখ</th>
                    <th className="py-3 px-4 font-bold">কুপন কোড</th>
                    <th className="py-3 px-4 font-bold">স্ট্যাটাস</th>
                    <th className="py-3 px-4 font-bold text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubscribers.length > 0 ? (
                    filteredSubscribers.map(subscriber => (
                      <tr key={subscriber.id} className="hover:bg-amber-50/30 transition-colors">
                        {/* Name / Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#7A1238]/10 text-[#7A1238] font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                              {subscriber.name ? subscriber.name.charAt(0) : subscriber.email.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block font-bangla">
                                {subscriber.name || 'নাম উল্লেখ নেই'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                ID: {subscriber.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 group">
                            <span className="font-mono text-gray-800 select-all">
                              {subscriber.email}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(subscriber.email);
                                setCopiedEmail(subscriber.email);
                                setTimeout(() => setCopiedEmail(null), 2000);
                              }}
                              title="ইমেইল কপি করুন"
                              className="text-gray-400 hover:text-[#7A1238] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-0.5"
                            >
                              {copiedEmail === subscriber.email ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-gray-600">
                          {subscriber.phone ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 font-sans">🇧🇩</span>
                              <span>{subscriber.phone}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Source */}
                        <td className="py-3.5 px-4 text-gray-500 font-bangla text-[11px]">
                          {subscriber.source}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                          {new Date(subscriber.subscribedAt).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        {/* Coupon */}
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-[#F8E8E9] text-[#7A1238] font-mono font-bold text-[11px] border border-[#BE0750]/20">
                            {subscriber.couponCode}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>সক্রিয়</span>
                          </span>
                        </td>

                        {/* Action: Delete */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি "${subscriber.email}" গ্রাহকটিকে মুছে ফেলতে চান?`)) {
                                deleteNewsletterSubscriber(subscriber.id);
                              }
                            }}
                            title="মুছে ফেলুন"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-500 font-bangla">
                        <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold">কোনো গ্রাহক পাওয়া যায়নি</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {subscriberSearchQuery ? 'সার্চ কুয়েরির সাথে মিল পাওয়া যায়নি' : 'এখনও কোনো সাবস্ক্রাইবার নিবন্ধিত হননি'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-bangla">
              <span>প্রদর্শিত গ্রাহক সংখ্যা: {filteredSubscribers.length} / {newsletterSubscribers.length}</span>
              <span>ডাটাবেস স্বয়ংক্রিয়ভাবে লোকাল স্টোরেজে সংরক্ষিত</span>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB: INVENTORY & STOCK MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="py-6 animate-fade-in">
          <InventoryManagementView />
        </div>
      )}

      {/* 10. TAB: STAFF & ROLE MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="py-6 animate-fade-in">
          <StaffManagementView />
        </div>
      )}

      {/* 11. TAB: VERIFIED REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="py-6 animate-fade-in">
          <ReviewModerationView />
        </div>
      )}

      {/* 12. TAB: FINANCIAL REPORTS & GATEWAY LEDGER */}
      {activeTab === 'finance' && (
        <div className="py-6 animate-fade-in">
          <FinancialReportView />
        </div>
      )}

      {/* 13. TAB: SECURITY AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="py-6 animate-fade-in">
          <AuditLogsView />
        </div>
      )}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 font-bangla">
                অর্ডার স্ট্যাটাস ও কুরিয়ার আপডেট ({editingOrder.orderNumber})
              </h3>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">অর্ডার স্ট্যাটাস:</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border rounded-xl bg-white font-medium"
                >
                  <option value="pending">Pending (পেন্ডিং)</option>
                  <option value="confirmed">Confirmed (নিশ্চিতকৃত)</option>
                  <option value="processing">Processing (প্যাকিং চলছে)</option>
                  <option value="shipped">Shipped (কুরিয়ারে হস্তান্তর)</option>
                  <option value="delivered">Delivered (ডেলিভারি সম্পন্ন)</option>
                  <option value="cancelled">Cancelled (বাতিলকৃত)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">কুরিয়ার সার্ভিস:</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={e => setCourierName(e.target.value)}
                  placeholder="e.g. Steadfast, Pathao, RedX"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">কুরিয়ার ট্র্যাকিং কোড:</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="e.g. STF-8891240"
                  className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold rounded-xl"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 font-bangla">
                {editingProduct ? 'পণ্য সংশোধন করুন' : 'নতুন পণ্য যোগ করুন'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">পণ্যের নাম (বাংলা):</label>
                  <input
                    type="text"
                    required
                    value={prodNameBn}
                    onChange={e => setProdNameBn(e.target.value)}
                    placeholder="যেমন: ঢাকাই জামদানি শাড়ি"
                    className="w-full px-3 py-2 border rounded-xl font-bangla"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">পণ্যের নাম (English):</label>
                  <input
                    type="text"
                    required
                    value={prodNameEn}
                    onChange={e => setProdNameEn(e.target.value)}
                    placeholder="e.g. Traditional Jamdani Saree"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">ক্যাটাগরি:</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.nameBn} ({c.nameEn})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">SKU:</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">স্টক পরিমাণ:</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={e => setProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">নিয়মিত মূল্য (৳):</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">ছাড় মূল্য (ঐচ্ছিক ৳):</label>
                  <input
                    type="number"
                    value={prodDiscountPrice ?? ''}
                    onChange={e => setProdDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="ডিসকাউন্ট না থাকলে খালি রাখুন"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">পণ্যের ছবি URL (কমা দিয়ে একাধিক):</label>
                <input
                  type="text"
                  required
                  value={prodImages}
                  onChange={e => setProdImages(e.target.value)}
                  placeholder="https://images.unsplash.com/..., https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">সাইজ অপশন (কমা দিয়ে):</label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={e => setProdSizes(e.target.value)}
                    placeholder="e.g. S, M, L, XL"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">রং অপশন (কমা দিয়ে):</label>
                  <input
                    type="text"
                    value={prodColors}
                    onChange={e => setProdColors(e.target.value)}
                    placeholder="e.g. Maroon, Emerald, Gold"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1">বিবরণ (Description):</label>
                <textarea
                  rows={3}
                  value={prodDesc}
                  onChange={e => setProdDesc(e.target.value)}
                  placeholder="পণ্যের বিস্তারিত বিবরণ..."
                  className="w-full px-3 py-2 border rounded-xl font-bangla"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={e => setProdIsFeatured(e.target.checked)}
                    className="rounded text-[#7A1238]"
                  />
                  <span>ফিচার্ড পণ্য (Featured)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsNew}
                    onChange={e => setProdIsNew(e.target.checked)}
                    className="rounded text-[#7A1238]"
                  />
                  <span>নতুন কালেকশন (New Arrival)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold rounded-xl"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {selectedInvoiceOrder && (
        <InvoiceView order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}
    </div>
  );
};
