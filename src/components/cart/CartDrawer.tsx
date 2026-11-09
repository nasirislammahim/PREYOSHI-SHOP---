import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    cartCount,
    cartSubtotal,
    cartDiscount,
    freeShippingProgress,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setCurrentView
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const grandTotal = Math.max(0, cartSubtotal - cartDiscount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#FFF9F2] h-full shadow-2xl flex flex-col justify-between animate-slide-left">
        {/* 1. Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#7A1238]/10 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F8E8E9] flex items-center justify-center text-[#7A1238]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold font-bangla text-base text-gray-900">আপনার শপিং ব্যাগ</h3>
              <p className="text-xs text-gray-500 font-medium">({cartCount} টি আইটেম)</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Free Delivery Threshold Banner */}
        <div className="bg-[#7A1238] text-white px-4 py-2.5 text-xs">
          <div className="flex items-center justify-between mb-1.5 font-medium">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#D9A441]" />
              {freeShippingProgress.qualifies ? (
                <span className="text-[#D9A441] font-bold font-bangla">অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন।</span>
              ) : (
                <span className="font-bangla">
                  ফ্রি ডেলিভারির জন্য আরও ৳{freeShippingProgress.remaining.toLocaleString()} টাকার শপিং করুন
                </span>
              )}
            </span>
            <span className="font-bold">{freeShippingProgress.percent}%</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#D9A441] h-full transition-all duration-300 rounded-full"
              style={{ width: `${freeShippingProgress.percent}%` }}
            />
          </div>
        </div>

        {/* 3. Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F8E8E9] flex items-center justify-center text-[#7A1238]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bangla font-semibold text-gray-800 text-sm">আপনার ব্যাগ এখনো খালি</p>
              <p className="text-xs text-gray-500 font-bangla max-w-xs">
                আমাদের ঐতিহ্যবাহী জামদানি শাড়ি, কুন্দন জুয়েলারি ও ড্রেস কালেকশন এক্সপ্লোর করুন!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#7A1238] text-white font-bold text-xs hover:bg-[#BE0750] transition-colors"
              >
                শপিং শুরু করুন
              </button>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs flex gap-3 relative"
              >
                {/* Thumbnail */}
                <img
                  src={item.image}
                  alt={item.nameEn}
                  className="w-18 h-22 object-cover rounded-xl bg-gray-50 shrink-0 border border-gray-100"
                />

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0 pr-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 font-bangla truncate leading-snug">
                      {item.nameBn}
                    </h4>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.nameEn}</p>

                    {/* Variant specs */}
                    {(item.selectedSize || item.selectedColor) && (
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                        {item.selectedSize && (
                          <span className="bg-[#F8E8E9] text-[#7A1238] px-1.5 py-0.5 rounded-md font-medium">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded-md">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity & Unit Price */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                    <span className="text-xs font-extrabold text-[#7A1238]">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>

                    {/* Quantity modifier */}
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden text-xs">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-0.5 hover:bg-gray-200 font-bold text-gray-600"
                      >
                        -
                      </button>
                      <span className="px-2 font-semibold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-0.5 hover:bg-gray-200 font-bold text-gray-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove item button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-2.5 right-2.5 p-1 text-gray-300 hover:text-red-500 transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* 4. Footer Summary & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#7A1238]/10 space-y-3">
            {/* Coupon Application Form */}
            {appliedCoupon ? (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">{appliedCoupon.code}</span>
                    <span className="text-[11px] ml-1">(-৳{cartDiscount.toLocaleString()})</span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  মুছে ফেলুন
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    placeholder="কুপন কোড (e.g. PREYOSHI10)"
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:border-[#BE0750] uppercase"
                  />
                  <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
                >
                  প্রয়োগ
                </button>
              </form>
            )}

            {couponFeedback && !appliedCoupon && (
              <p className={`text-[11px] ${couponFeedback.success ? 'text-emerald-600' : 'text-red-500'}`}>
                {couponFeedback.message}
              </p>
            )}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-1">
              <div className="flex justify-between">
                <span>সাবটোটাল:</span>
                <span className="font-bold text-gray-900">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>কুপন ডিসকাউন্ট:</span>
                  <span>-৳{cartDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>ডেলিভারি চার্জ:</span>
                <span>চেকআউট পেজে গণনা হবে</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-[#7A1238] pt-2 border-t border-gray-100">
                <span>সর্বমোট (আনুমানিক):</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedCheckout}
              className="w-full py-3.5 rounded-2xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            >
              <span className="font-bangla">অর্ডার করতে এগিয়ে যান</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
