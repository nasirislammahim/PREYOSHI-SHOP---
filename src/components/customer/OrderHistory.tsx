import React, { useState, useMemo } from 'react';
import {
  Package, Search, Printer, RotateCcw, Copy, Check, ShoppingBag,
  Truck, CheckCircle2, Clock, AlertCircle, ExternalLink, ChevronDown,
  ChevronUp, MessageSquare, ShieldCheck, Sparkles, MapPin, CreditCard
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { InvoiceView } from '../orders/InvoiceView';

interface OrderHistoryProps {
  userPhone: string;
  userId?: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ userPhone, userId }) => {
  const {
    orders,
    products,
    addToCart,
    setIsCartOpen,
    setIsProfileOpen,
    setIsOrderTrackingOpen,
    setCurrentView,
    setSelectedProductId,
    setIsChatOpen
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show notification toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter orders belonging to this user
  const userOrders = useMemo(() => {
    const cleanUserPhone = userPhone.replace(/[^0-9]/g, '');
    return orders.filter(o => {
      const matchUserId = userId && o.userId === userId;
      const cleanOrderPhone = o.phone ? o.phone.replace(/[^0-9]/g, '') : '';
      const matchPhone = cleanUserPhone && cleanOrderPhone && (
        cleanOrderPhone.endsWith(cleanUserPhone.slice(-8)) || cleanUserPhone.endsWith(cleanOrderPhone.slice(-8))
      );
      return matchUserId || matchPhone;
    });
  }, [orders, userPhone, userId]);

  // Status-based counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: userOrders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    userOrders.forEach(o => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [userOrders]);

  // Overall order metrics
  const metrics = useMemo(() => {
    const totalOrders = userOrders.length;
    const inTransitOrProcessing = userOrders.filter(o => o.status === 'shipped' || o.status === 'processing').length;
    const delivered = userOrders.filter(o => o.status === 'delivered').length;
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    return { totalOrders, inTransitOrProcessing, delivered, totalSpent };
  }, [userOrders]);

  // Apply search and status filter
  const filteredOrders = useMemo(() => {
    return userOrders.filter(o => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = o.orderNumber.toLowerCase().includes(q);
        const matchTracking = o.trackingNumber?.toLowerCase().includes(q);
        const matchCourier = o.courierName?.toLowerCase().includes(q);
        const matchItem = o.items.some(
          i => i.nameEn.toLowerCase().includes(q) || i.nameBn.includes(q)
        );
        if (!matchNumber && !matchTracking && !matchCourier && !matchItem) return false;
      }
      return true;
    });
  }, [userOrders, statusFilter, searchQuery]);

  const handleCopyTracking = (trackingId: string) => {
    navigator.clipboard?.writeText(trackingId);
    setCopiedTracking(trackingId);
    showToast(`ট্র্যাকিং নম্বর কপি করা হয়েছে: ${trackingId}`);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  // Re-order ALL items from past order
  const handleReorderOrder = (order: Order) => {
    let itemsAdded = 0;
    order.items.forEach(item => {
      // Find latest product in catalog if available
      const liveProduct = products.find(p => p.id === item.productId);
      
      const productToAdd = liveProduct || {
        id: item.productId,
        nameEn: item.nameEn,
        nameBn: item.nameBn,
        sku: 'PRY-REORDER',
        categoryId: 'saree',
        description: '',
        regularPrice: item.price,
        stock: 15,
        status: 'active' as const,
        isFeatured: false,
        isNewArrival: false,
        isBestSeller: false,
        images: [item.image],
        sizes: item.selectedSize ? [item.selectedSize] : [],
        colors: item.selectedColor ? [item.selectedColor] : [],
        rating: 5,
        reviewCount: 1,
        createdAt: new Date().toISOString()
      };

      addToCart(productToAdd, item.quantity, item.selectedSize, item.selectedColor);
      itemsAdded += item.quantity;
    });

    showToast(`অর্ডার #${order.orderNumber}-এর ${itemsAdded} টি পণ্য সফলভাবে কার্ট-এ যুক্ত হয়েছে!`);
    setIsProfileOpen(false);
    setIsCartOpen(true);
  };

  // Re-order a SINGLE item from an order
  const handleReorderSingleItem = (item: Order['items'][0], e?: React.MouseEvent) => {
    e?.stopPropagation();
    const liveProduct = products.find(p => p.id === item.productId);

    const productToAdd = liveProduct || {
      id: item.productId,
      nameEn: item.nameEn,
      nameBn: item.nameBn,
      sku: 'PRY-REORDER',
      categoryId: 'saree',
      description: '',
      regularPrice: item.price,
      stock: 15,
      status: 'active' as const,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      images: [item.image],
      sizes: item.selectedSize ? [item.selectedSize] : [],
      colors: item.selectedColor ? [item.selectedColor] : [],
      rating: 5,
      reviewCount: 1,
      createdAt: new Date().toISOString()
    };

    addToCart(productToAdd, item.quantity || 1, item.selectedSize, item.selectedColor);
    showToast(`"${item.nameBn}" কার্ট-এ যুক্ত হয়েছে!`);
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product_detail');
    setIsProfileOpen(false);
  };

  const statusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>ডেলিভার্ড</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>কুরিয়ারে আছে</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>প্রসেসিং ও প্যাকিং</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>নিশ্চিতকৃত</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>বাতিল</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>পেন্ডিং</span>
          </span>
        );
    }
  };

  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      default: return 0;
    }
  };

  // Generate realistic milestones based on order status and date
  const getTimelineMilestones = (order: Order) => {
    const baseDate = new Date(order.createdAt);
    const formatDate = (daysAhead: number, hours: number, mins: number) => {
      const d = new Date(baseDate.getTime() + daysAhead * 86400000);
      d.setHours(hours, mins);
      return d.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit'
      });
    };

    const milestones = [
      {
        step: 1,
        title: 'অর্ডার প্লেস করা হয়েছে',
        desc: `গ্রাহক কর্তৃক অনলাইন অর্ডার গ্রহণ সম্পন্ন। পেমেন্ট পদ্ধতি: ${order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'অনলাইন বিকাশ/নগদ'}`,
        time: formatDate(0, 10, 15),
        done: true
      },
      {
        step: 2,
        title: 'অর্ডার নিশ্চিতকরণ (Confirmed)',
        desc: 'কাস্টমার কেয়ার টিম কর্তৃক অর্ডার ও ডেলিভারি ঠিকানা সফলভাবে যাচাইকৃত।',
        time: formatDate(0, 14, 30),
        done: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
      },
      {
        step: 3,
        title: 'কোয়ালিটি চেক ও প্যাকিং সম্পন্ন',
        desc: 'প্রেয়সী সেন্ট্রাল ওয়্যারহাউস মিরপুরে পণ্যের গুণগত মান যাচাই এবং প্রিমিয়াম প্যাকেজিং সম্পন্ন।',
        time: formatDate(1, 11, 45),
        done: ['processing', 'shipped', 'delivered'].includes(order.status)
      },
      {
        step: 4,
        title: `${order.courierName || 'কুরিয়ার'} পার্সেল হস্তান্তর ও ট্র্যাকিং জেনারেটেড`,
        desc: order.trackingNumber
          ? `কুরিয়ারে হস্তান্তর সম্পন্ন। ট্র্যাকিং আইডি: ${order.trackingNumber}। পার্সেল ডেলিভারি রাইডারের পথে রয়েছে।`
          : 'কুরিয়ারে হ্যান্ডওভার প্রক্রিয়াধীন।',
        time: formatDate(1, 17, 20),
        done: ['shipped', 'delivered'].includes(order.status)
      },
      {
        step: 5,
        title: 'সফল ডেলিভারি সম্পন্ন',
        desc: `গ্রাহকের নিকট পার্সেল পৌঁছানো হয়েছে। ক্যাশ কালেকশন: ৳${order.grandTotal.toLocaleString()}।`,
        time: formatDate(2, 16, 10),
        done: order.status === 'delivered'
      }
    ];

    return milestones;
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-[#7A1238] text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bangla animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D9A441]" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Quick Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bangla mb-1">
            <Package className="w-3.5 h-3.5 text-[#7A1238]" />
            <span>মোট অর্ডার</span>
          </div>
          <p className="text-lg font-black text-gray-900 font-mono">
            {metrics.totalOrders}
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bangla mb-1">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>প্রসেসিং / কুরিয়ারে</span>
          </div>
          <p className="text-lg font-black text-indigo-700 font-mono">
            {metrics.inTransitOrProcessing}
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bangla mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>সফল ডেলিভারি</span>
          </div>
          <p className="text-lg font-black text-emerald-700 font-mono">
            {metrics.delivered}
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-bangla mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>সর্বমোট কেনাকাটা</span>
          </div>
          <p className="text-sm sm:text-base font-black text-[#7A1238] font-mono">
            ৳{metrics.totalSpent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 2. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-gray-200">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="অর্ডার নং, পণ্যের নাম বা ট্র্যাকিং দিয়ে খুঁজুন..."
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-[#BE0750] transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pb-0.5 sm:pb-0">
          {[
            { id: 'all', label: 'সকল', count: statusCounts.all },
            { id: 'shipped', label: 'শিপড / কুরিয়ার', count: statusCounts.shipped },
            { id: 'processing', label: 'প্রসেসিং', count: statusCounts.processing },
            { id: 'delivered', label: 'ডেলিভার্ড', count: statusCounts.delivered },
            { id: 'confirmed', label: 'নিশ্চিত', count: statusCounts.confirmed },
            { id: 'pending', label: 'পেন্ডিং', count: statusCounts.pending }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#7A1238] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Order Cards List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-dashed border-gray-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F8E8E9] text-[#7A1238] mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 font-bangla">কোনো অর্ডার পাওয়া যায়নি</h4>
            <p className="text-xs text-gray-500 font-bangla mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'আপনার সার্চ কুয়েরির সাথে কোনো অর্ডার মেলেনি। দয়া করে অন্য কোনো তথ্য দিয়ে খুঁজুন।'
                : 'আপনার এই ক্যাটাগরিতে কোনো অর্ডার রেকর্ড নেই।'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          {filteredOrders.map(order => {
            const stepIndex = getStepProgress(order.status);
            const isTimelineOpen = expandedTimelineId === order.id;
            const milestones = getTimelineMilestones(order);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-2xs hover:shadow-md transition-all p-4 sm:p-5 space-y-4 text-xs"
              >
                {/* Header: Order ID, Date, Amount, Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#7A1238] bg-[#F8E8E9] px-3 py-1 rounded-xl border border-[#7A1238]/10">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-gray-500 font-bangla">
                      {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-bangla font-semibold">সর্বমোট বিল</span>
                      <strong className="text-base font-black text-[#7A1238] font-mono">
                        ৳{order.grandTotal.toLocaleString()}
                      </strong>
                    </div>
                    {statusBadge(order.status)}
                  </div>
                </div>

                {/* Real-Time Visual Progress Stepper (if not cancelled) */}
                {order.status !== 'cancelled' ? (
                  <div className="bg-[#FFF9F2] p-3.5 rounded-2xl border border-[#D9A441]/20 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bangla font-bold">
                      <div className="flex items-center gap-1.5 text-[#7A1238]">
                        <Clock className="w-3.5 h-3.5 text-[#D9A441]" />
                        <span>লাইভ ডেলিভারি অগ্রগতি:</span>
                      </div>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-stone-700 border border-gray-200 font-mono">
                        ধাপ {stepIndex} / ৫
                      </span>
                    </div>

                    {/* Step Labels */}
                    <div className="grid grid-cols-5 text-center text-[10px] text-gray-500 font-bangla pt-1">
                      <div className={stepIndex >= 1 ? 'font-bold text-[#7A1238]' : 'text-gray-400'}>
                        অর্ডার গৃহিত
                      </div>
                      <div className={stepIndex >= 2 ? 'font-bold text-[#7A1238]' : 'text-gray-400'}>
                        কনফার্মড
                      </div>
                      <div className={stepIndex >= 3 ? 'font-bold text-[#7A1238]' : 'text-gray-400'}>
                        প্যাকিং চলছে
                      </div>
                      <div className={stepIndex >= 4 ? 'font-bold text-indigo-700' : 'text-gray-400'}>
                        কুরিয়ারে আছে
                      </div>
                      <div className={stepIndex >= 5 ? 'font-bold text-emerald-700' : 'text-gray-400'}>
                        ডেলিভার্ড
                      </div>
                    </div>

                    {/* Stepper Bar */}
                    <div className="w-full bg-gray-200/70 h-2 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#7A1238] via-[#BE0750] to-emerald-600 h-full rounded-full transition-all duration-700 relative"
                        style={{ width: `${(stepIndex / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 text-red-700 text-xs font-bangla rounded-2xl flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>এই অর্ডারটি বাতিল করা হয়েছে। প্রয়োজনে সহায়তার জন্য লাইভ সাপোর্টে নক করুন।</span>
                  </div>
                )}

                {/* Courier Info & Tracking Bar */}
                {order.courierName && (
                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200/70 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block font-bangla">কুরিয়ার পার্টনার</span>
                        <strong className="text-gray-900 font-bangla">{order.courierName}</strong>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-gray-700 bg-white px-2.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
                          <span className="text-[10px] text-gray-400 font-sans">Trk:</span>
                          <span className="font-bold">{order.trackingNumber}</span>
                          <button
                            onClick={() => handleCopyTracking(order.trackingNumber!)}
                            className="text-gray-400 hover:text-gray-800 transition-colors ml-1 cursor-pointer"
                            title="Copy tracking number"
                          >
                            {copiedTracking === order.trackingNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            setIsOrderTrackingOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] font-bangla flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>লাইভ ট্র্যাকিং</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Toggleable Status Milestones & Audit Timeline */}
                <div>
                  <button
                    onClick={() => setExpandedTimelineId(isTimelineOpen ? null : order.id)}
                    className="text-[11px] font-bold text-[#7A1238] hover:text-[#BE0750] flex items-center gap-1.5 cursor-pointer font-bangla transition-colors py-1"
                  >
                    {isTimelineOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{isTimelineOpen ? 'আপডেট টাইমলাইন লুকান' : 'বিস্তারিত স্ট্যাটাস আপডেট ও টাইমলাইন দেখুন'}</span>
                  </button>

                  {isTimelineOpen && (
                    <div className="mt-3 p-4 bg-white rounded-2xl border border-gray-200/90 shadow-inner space-y-3 animate-fade-in">
                      <h5 className="font-bold text-xs text-gray-900 font-bangla flex items-center gap-1.5 pb-2 border-b border-gray-100">
                        <Clock className="w-3.5 h-3.5 text-[#7A1238]" />
                        <span>অর্ডার অগ্রগতি টাইমলাইন (Status Milestones)</span>
                      </h5>

                      <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                        {milestones.map((m, mIdx) => (
                          <div key={mIdx} className="relative group">
                            {/* Bullet */}
                            <div
                              className={`absolute -left-5 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                m.done
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-white border-gray-300 text-transparent'
                              }`}
                            >
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>

                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className={`font-bold font-bangla text-xs ${m.done ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {m.title}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {m.time}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 font-bangla mt-0.5 leading-relaxed">
                                {m.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-bangla">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>ডেলিভারি ঠিকানা: {order.deliveryAddress}, {order.district}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ordered Items List with Individual "Re-order item" buttons */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold text-gray-500 font-bangla flex items-center justify-between">
                    <span>অর্ডারের পণ্যসমূহ ({order.items.length} টি):</span>
                    <span className="text-[10px] text-gray-400">প্রতিটি পণ্য আলাদাভাবেও আবার অর্ডার করতে পারবেন</span>
                  </div>

                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/70 hover:bg-gray-50 p-2.5 rounded-2xl border border-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.nameEn}
                          onClick={() => handleViewProduct(item.productId)}
                          className="w-12 h-14 object-cover rounded-xl border border-gray-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                        <div className="min-w-0">
                          <h5
                            onClick={() => handleViewProduct(item.productId)}
                            className="font-bold text-gray-900 font-bangla text-xs hover:text-[#7A1238] cursor-pointer transition-colors line-clamp-1"
                          >
                            {item.nameBn}
                          </h5>
                          <p className="text-[11px] text-gray-500 truncate">{item.nameEn}</p>
                          <div className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-1.5 font-bangla">
                            {item.selectedSize && (
                              <span className="bg-white px-1.5 py-0.2 rounded border border-gray-200">
                                সাইজ: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="bg-white px-1.5 py-0.2 rounded border border-gray-200">
                                কালার: {item.selectedColor}
                              </span>
                            )}
                            <span className="text-gray-400">· পরিমাণ: {item.quantity} টি</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-200/60">
                        <div className="text-right">
                          <span className="text-xs font-bold text-gray-900 font-mono block">
                            ৳{(item.price * item.quantity).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ৳{item.price.toLocaleString()} × {item.quantity}
                          </span>
                        </div>

                        {/* Individual Item Re-order Button */}
                        <button
                          onClick={e => handleReorderSingleItem(item, e)}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F8E8E9] border border-gray-200 hover:border-[#7A1238] text-gray-700 hover:text-[#7A1238] font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-2xs font-bangla"
                          title="এই পণ্যটি আবার কার্ট-এ যুক্ত করুন"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-[#7A1238]" />
                          <span>আবার কিনুন</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions: PDF Invoice & Entire Order Re-order */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-gray-100">
                  <div className="text-[11px] text-gray-600 font-bangla flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    <span>পেমেন্ট: <strong className="uppercase font-mono text-gray-900">{order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (COD)' : order.paymentMethod}</strong></span>
                    {order.transactionId && (
                      <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1.5 py-0.2 rounded">
                        Trx: {order.transactionId}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live Support shortcut */}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsChatOpen(true);
                      }}
                      className="p-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                      title="অর্ডার নিয়ে সহায়তা চান? লাইভ চ্যাট করুন"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    {/* PDF Invoice Button */}
                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#7A1238] text-gray-700 hover:text-[#7A1238] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer bg-white shadow-2xs"
                      title="Download or Print PDF Invoice"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#7A1238]" />
                      <span className="font-bangla">PDF ইনভয়েস</span>
                    </button>

                    {/* Prominent RE-ORDER ENTIRE ORDER Button */}
                    <button
                      onClick={() => handleReorderOrder(order)}
                      className="px-4 py-2 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] active:scale-98 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#7A1238]/15"
                      title="Re-order all items from this order"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#D9A441]" />
                      <span className="font-bangla font-bold">সম্পূর্ণ অর্ডার আবার করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Modal for View / Print */}
      {selectedInvoiceOrder && (
        <InvoiceView
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
