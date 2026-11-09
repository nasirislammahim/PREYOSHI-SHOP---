import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft, Truck, ShieldCheck, CheckCircle2, AlertCircle,
  Tag, CreditCard, Banknote, Smartphone, ShoppingBag, Award
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { BANGLADESH_DIVISIONS } from '../../data/bangladeshLocations';
import { PaymentMethod, DeliveryType } from '../../types';
import { AccountOfferModal } from './AccountOfferModal';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings,
    placeOrder,
    setCurrentView,
    setIsAuthOpen
  } = useStore();

  const { currentUser, earnPoints } = useAuth();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [hasDeclinedOffer, setHasDeclinedOffer] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(!currentUser || currentUser.id === 'USR-GUEST');

  // Form Fields
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [division, setDivision] = useState(currentUser?.division || 'Dhaka');
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka');
  const [upazila, setUpazila] = useState('');
  const [areaVillage, setAreaVillage] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [orderNotes, setOrderNotes] = useState('');

  // Delivery & Payment
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('courier');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [transactionId, setTransactionId] = useState('');

  // Coupon state inside checkout
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Districts based on selected division
  const availableDistricts = useMemo(() => {
    const divObj = BANGLADESH_DIVISIONS.find(d => d.name === division);
    return divObj ? divObj.districts : [];
  }, [division]);

  // Thanas based on selected district
  const availableThanas = useMemo(() => {
    const distObj = availableDistricts.find(d => d.name === district);
    return distObj ? distObj.thanas : [];
  }, [availableDistricts, district]);

  // Dynamic Delivery Charge Calculation
  const isInsideDhaka = district.toLowerCase() === 'dhaka';

  const deliveryCharge = useMemo(() => {
    // Check free delivery threshold
    if (cartSubtotal >= settings.delivery.freeDeliveryThreshold) {
      return 0;
    }

    if (deliveryType === 'own') {
      return settings.delivery.ownDeliveryCharge;
    }

    // Courier delivery
    return isInsideDhaka
      ? settings.delivery.insideDhakaCharge
      : settings.delivery.outsideDhakaCharge;
  }, [cartSubtotal, deliveryType, isInsideDhaka, settings.delivery]);

  // Grand Total = Subtotal + Delivery - Discount
  const grandTotal = Math.max(0, cartSubtotal + deliveryCharge - cartDiscount);

  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    const divObj = BANGLADESH_DIVISIONS.find(d => d.name === newDivision);
    if (divObj && divObj.districts.length > 0) {
      setDistrict(divObj.districts[0].name);
      if (divObj.districts[0].thanas.length > 0) {
        setUpazila(divObj.districts[0].thanas[0]);
      } else {
        setUpazila('');
      }
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const distObj = availableDistricts.find(d => d.name === newDistrict);
    if (distObj && distObj.thanas.length > 0) {
      setUpazila(distObj.thanas[0]);
    } else {
      setUpazila('');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput);
    setCouponMsg(res);
    if (res.success) setCouponCodeInput('');
  };

  const executeOrderPlacement = async () => {
    // Validate phone number (Bangladesh format: 11 digits starting with 013, 014, 015, 016, 017, 018, 019)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11 || !cleanPhone.startsWith('01')) {
      setSubmitError('সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর প্রদান করুন (যেমন: 01712345678)');
      return;
    }

    if (!deliveryAddress.trim()) {
      setSubmitError('দয়া করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    if (cart.length === 0) {
      setSubmitError('আপনার কার্ট খালি। অনুগ্রহ করে পণ্য যোগ করুন।');
      return;
    }

    // Require transaction ID if bKash / Nagad / Rocket selected
    if (paymentMethod !== 'cod' && !transactionId.trim()) {
      setSubmitError(`অনুগ্রহ করে ${paymentMethod.toUpperCase()} ট্রানজেকশন আইডি (TrxID) প্রদান করুন।`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cart.map(item => ({
        productId: item.productId,
        nameEn: item.nameEn,
        nameBn: item.nameBn,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

      const isGuest = !currentUser || currentUser.id === 'USR-GUEST';

      const result = await placeOrder({
        customerName: customerName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        division,
        district,
        upazila: upazila || 'Sadar',
        areaVillage: areaVillage.trim() || district,
        deliveryAddress: deliveryAddress.trim(),
        orderNotes: orderNotes.trim() || undefined,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        transactionId: transactionId.trim() || undefined,
        deliveryType,
        courierName: deliveryType === 'courier' ? (isInsideDhaka ? 'Steadfast Courier' : 'Pathao Courier') : 'Preyoshi Own Delivery',
        subtotal: cartSubtotal,
        deliveryCharge,
        discount: cartDiscount,
        grandTotal,
        couponCode: appliedCoupon?.code,
        items: orderItems,
        userId: isGuest ? 'USR-GUEST' : currentUser?.id
      });

      if (!result.success) {
        setSubmitError(result.error || 'অর্ডার করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        setIsSubmitting(false);
        return;
      }

      // Automatically award loyalty points if user has account
      const earnedPoints = Math.max(10, Math.round(grandTotal / 20));
      if (earnPoints && currentUser && currentUser.id !== 'USR-GUEST') {
        earnPoints(earnedPoints, `অর্ডার #${result.orderNumber} কেনাকাটায় অর্জিত পয়েন্ট`, result.orderNumber);
      }

      // Celebrate with festive confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7A1238', '#BE0750', '#D9A441', '#FFF9F2']
      });

    } catch (err) {
      setSubmitError('একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। দয়া করে পুনরায় চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Module 6: Show Account Creation Offer to Guests once before final submission
    const isGuest = !currentUser || currentUser.id === 'USR-GUEST';
    if (isGuest && !hasDeclinedOffer) {
      setShowOfferModal(true);
      return;
    }

    await executeOrderPlacement();
  };

  const handleProceedAsGuestFromModal = () => {
    setHasDeclinedOffer(true);
    setShowOfferModal(false);
    executeOrderPlacement();
  };

  const handleCreateAccountFromModal = () => {
    setShowOfferModal(false);
    setIsAuthOpen(true);
  };


  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-[#F8E8E9] text-[#7A1238] rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold font-bangla text-gray-900">আপনার কার্ট বর্তমানে খালি</h2>
        <p className="text-xs text-gray-500 font-bangla mt-1 max-w-sm mx-auto">
          চেকআউট করতে প্রথমে পণ্য কার্ট-এ যুক্ত করুন।
        </p>
        <button
          onClick={() => setCurrentView('store')}
          className="mt-6 px-6 py-3 rounded-2xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs font-bangla shadow-sm transition-colors cursor-pointer"
        >
          স্টোরে পণ্য দেখুন
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setCurrentView('store')}
          className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-[#F8E8E9] hover:text-[#7A1238] transition-colors cursor-pointer"
          title="Back to store"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-bangla text-[#2A101A]">
            চেকআউট ও ডেলিভারি তথ্য
          </h1>
          <p className="text-xs text-gray-500 font-bangla">
            ক্যাশ অন ডেলিভারি অথবা বিকাশ/নগদে নিশ্চিন্তে অর্ডার সম্পন্ন করুন
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Shipping & Payment Info (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Customer Contact Details */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-bangla text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#7A1238] text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>গ্রাহকের তথ্য ও মোবাইল নম্বর</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="যেমন: তানজিলা আহমেদ"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750] focus:ring-1 focus:ring-[#BE0750]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  মোবাইল নম্বর (১১ ডিজিট) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="যেমন: 01712345678"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750] focus:ring-1 focus:ring-[#BE0750]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  ইমেইল ঠিকানা (ঐচ্ছিক - ইনভয়েস রসিদের জন্য)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750]"
                />
              </div>
            </div>
          </div>

          {/* 2. Bangladesh Shipping Address */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-bangla text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#7A1238] text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>ডেলিভারি ঠিকানা (বাংলাদেশ)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  বিভাগ (Division) <span className="text-red-500">*</span>
                </label>
                <select
                  value={division}
                  onChange={e => handleDivisionChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750] bg-white cursor-pointer font-bangla"
                >
                  {BANGLADESH_DIVISIONS.map(div => (
                    <option key={div.name} value={div.name}>
                      {div.nameBn} ({div.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  জেলা (District) <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750] bg-white cursor-pointer font-bangla"
                >
                  {availableDistricts.map(dist => (
                    <option key={dist.name} value={dist.name}>
                      {dist.nameBn} ({dist.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  উপজেলা / থানা (Thana) <span className="text-red-500">*</span>
                </label>
                {availableThanas.length > 0 ? (
                  <select
                    value={upazila}
                    onChange={e => setUpazila(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750] bg-white cursor-pointer"
                  >
                    {availableThanas.map(th => (
                      <option key={th} value={th}>
                        {th}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={upazila}
                    onChange={e => setUpazila(e.target.value)}
                    placeholder="যেমন: সদর"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  এলাকা / গ্রাম / পাড়া
                </label>
                <input
                  type="text"
                  value={areaVillage}
                  onChange={e => setAreaVillage(e.target.value)}
                  placeholder="যেমন: রোড ১১, সেক্টর ৭"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  সম্পূর্ণ ঠিকানা (বাসা/ফ্ল্যাট নং, রাস্তা, ল্যান্ডমার্ক) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="যেমন: বাসা ২৮, ফ্ল্যাট ৪বি, রোড ১১, ধানমন্ডি, ঢাকা"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  অর্ডার সংক্রান্ত বিশেষ নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="যেমন: অফিসে ডেলিভারি হবে, ৩টার পর কল করবেন"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:border-[#BE0750]"
                />
              </div>
            </div>
          </div>

          {/* 3. Delivery Method Selection */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold font-bangla text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#7A1238] text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>ডেলিভারি মাধ্যম নির্বাচন করুন</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setDeliveryType('courier')}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                  deliveryType === 'courier'
                    ? 'border-[#7A1238] bg-[#F8E8E9]/30 ring-1 ring-[#7A1238]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'courier'}
                  onChange={() => setDeliveryType('courier')}
                  className="mt-0.5 text-[#7A1238] focus:ring-[#7A1238]"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 font-bangla">কুরিয়ার ডেলিভারি</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {isInsideDhaka
                      ? `ঢাকা সিটিতে ৳${settings.delivery.insideDhakaCharge} (২৪-৪৮ ঘণ্টা)`
                      : `ঢাকার বাইরে ৳${settings.delivery.outsideDhakaCharge} (৪৮-৭২ ঘণ্টা)`}
                  </p>
                </div>
              </label>

              <label
                onClick={() => setDeliveryType('own')}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                  deliveryType === 'own'
                    ? 'border-[#7A1238] bg-[#F8E8E9]/30 ring-1 ring-[#7A1238]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'own'}
                  onChange={() => setDeliveryType('own')}
                  className="mt-0.5 text-[#7A1238] focus:ring-[#7A1238]"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 font-bangla">নিজস্ব ডেলিভারি (Own Rider)</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    স্টোরের নিজস্ব রাইডার ডেলিভারি - ৳{settings.delivery.ownDeliveryCharge}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 4. Payment Method Selection */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-bangla text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#7A1238] text-white text-xs flex items-center justify-center font-bold">4</span>
              <span>পেমেন্ট পদ্ধতি</span>
            </h3>

            <div className="space-y-2.5">
              {/* Cash on Delivery (Active) */}
              <label
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-[#7A1238] bg-[#F8E8E9]/40'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-[#7A1238] focus:ring-[#7A1238]"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 font-bangla flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#7A1238]" />
                      <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 font-bangla">
                      পণ্য হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  সক্রিয় (Active)
                </span>
              </label>

              {/* bKash */}
              <label
                onClick={() => setPaymentMethod('bkash')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 cursor-pointer ${
                  paymentMethod === 'bkash'
                    ? 'border-[#E2136E] bg-[#E2136E]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="text-[#E2136E] focus:ring-[#E2136E]"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#E2136E] text-white text-[10px] flex items-center justify-center font-bold">৳</span>
                        <span>bKash (বিকাশ পেমেন্ট / সেন্ড মানি)</span>
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        নম্বর: <strong>{settings.payment.bkashNumber}</strong> ({settings.payment.bkashAccountType})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">ম্যানুয়াল ভেরিফিকেশন</span>
                </div>

                {paymentMethod === 'bkash' && (
                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-700 bg-white p-3 rounded-xl space-y-2">
                    <p className="font-bangla text-[11px]">
                      ১. আপনার বিকাশ অ্যাপ থেকে <strong>{settings.payment.bkashNumber}</strong> নম্বরে ৳{grandTotal.toLocaleString()} সেন্ড মানি / পেমেন্ট করুন।<br />
                      ২. পেমেন্ট সম্পন্ন হলে প্রাপ্ত ট্রানজেকশন আইডি (TrxID) নিচে দিন:
                    </p>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="বিকাশ TrxID লিখুন (e.g. 9J87AKQ1)"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg uppercase"
                    />
                  </div>
                )}
              </label>

              {/* Nagad */}
              <label
                onClick={() => setPaymentMethod('nagad')}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 cursor-pointer ${
                  paymentMethod === 'nagad'
                    ? 'border-[#F7941D] bg-[#F7941D]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="text-[#F7941D] focus:ring-[#F7941D]"
                    />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">Nagad (নগদ)</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        নম্বর: <strong>{settings.payment.nagadNumber}</strong> ({settings.payment.nagadAccountType})
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">ম্যানুয়াল ভেরিফিকেশন</span>
                </div>

                {paymentMethod === 'nagad' && (
                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-700 bg-white p-3 rounded-xl space-y-2">
                    <p className="font-bangla text-[11px]">
                      নগদ নম্বরে ৳{grandTotal.toLocaleString()} পরিশোধ করে প্রাপ্ত TrxID প্রদান করুন:
                    </p>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="নগদ TrxID লিখুন"
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg uppercase"
                    />
                  </div>
                )}
              </label>

              {/* Rocket */}
              <label
                onClick={() => setPaymentMethod('rocket')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                  paymentMethod === 'rocket'
                    ? 'border-[#8C3494] bg-[#8C3494]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'rocket'}
                    onChange={() => setPaymentMethod('rocket')}
                    className="text-[#8C3494] focus:ring-[#8C3494]"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">Rocket (রকেট)</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      নম্বর: {settings.payment.rocketNumber}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">বিকল্প মাধ্যম</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-md sticky top-28 space-y-5">
            <h3 className="text-base font-bold font-bangla text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>অর্ডার বিবরণী</span>
              <span className="text-xs text-gray-500 font-normal">({cart.length} টি আইটেম)</span>
            </h3>

            {/* Item list in checkout */}
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1 space-y-2">
              {cart.map(item => (
                <div key={item.id} className="pt-2 flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.nameEn}
                    className="w-12 h-14 object-cover rounded-lg border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 font-bangla truncate">{item.nameBn}</h4>
                    <p className="text-[11px] text-gray-500 truncate">{item.nameEn}</p>
                    <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                      {item.selectedSize && <span>{item.selectedSize}</span>}
                      {item.selectedColor && <span>· {item.selectedColor}</span>}
                      <span>· Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div className="pt-3 border-t border-gray-100">
              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>কুপন <strong>{appliedCoupon.code}</strong> সক্রিয়!</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    বাদ দিন
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={e => setCouponCodeInput(e.target.value)}
                    placeholder="কুপন কোড (e.g. PREYOSHI10)"
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-[#BE0750] uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3.5 py-1.5 bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    প্রয়োগ
                  </button>
                </div>
              )}
              {couponMsg && !appliedCoupon && (
                <p className={`text-[11px] mt-1.5 ${couponMsg.success ? 'text-emerald-600' : 'text-red-500'}`}>
                  {couponMsg.message}
                </p>
              )}
            </div>

            {/* Summary Breakdown */}
            <div className="space-y-2 text-xs text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex justify-between">
                <span>সাবটোটাল (Subtotal):</span>
                <span className="font-semibold text-gray-900">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  ডেলিভারি চার্জ ({deliveryType === 'own' ? 'নিজস্ব রাইডার' : isInsideDhaka ? 'ঢাকা' : 'ঢাকার বাইরে'}):
                </span>
                <span className="font-semibold text-gray-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">ফ্রি (Free)</span>
                  ) : (
                    `৳${deliveryCharge.toLocaleString()}`
                  )}
                </span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>ডিসকাউন্ট (Discount):</span>
                  <span>-৳{cartDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-[#7A1238] pt-3 border-t border-gray-200">
                <span className="font-bangla">সর্বমোট প্রদেয় বিল:</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Loyalty Points Earning Indicator */}
            <div className="p-2.5 rounded-xl bg-[#FFF9F2] border border-[#D9A441]/30 flex items-center justify-between text-[11px] font-bangla text-[#7A1238]">
              <span className="flex items-center gap-1.5 font-bold">
                <Award className="w-4 h-4 text-[#D9A441]" />
                <span>এই অর্ডারে রিওয়ার্ড পয়েন্ট পাবেন:</span>
              </span>
              <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                +{Math.max(10, Math.round(grandTotal / 20))} pts (৳{Math.max(10, Math.round(grandTotal / 20))})
              </span>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span className="font-bangla">{submitError}</span>
              </div>
            )}

            {/* Confirm Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all active:scale-98 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed group ring-2 ring-[#D9A441]/40"
            >
              <ShieldCheck className="w-5 h-5 text-[#D9A441]" />
              <span className="font-bangla">
                {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : `অর্ডার নিশ্চিত করুন (৳${grandTotal.toLocaleString()})`}
              </span>
            </button>

            <p className="text-[11px] text-center text-gray-500 font-bangla">
              অর্ডার নিশ্চিত করার মাধ্যমে আপনি প্রেয়সী শপের শর্তাবলী ও গোপনীয়তা নীতির সাথে সম্মত হচ্ছেন।
            </p>
          </div>
        </div>
      </form>
      <AccountOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onProceedAsGuest={handleProceedAsGuestFromModal}
        onCreateAccount={handleCreateAccountFromModal}
      />
    </div>
  );
};
