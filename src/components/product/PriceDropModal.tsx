import React, { useState } from 'react';
import {
  Bell, X, Tag, DollarSign, Mail, Phone, CheckCircle2,
  AlertCircle, ShieldCheck, Trash2, ArrowRight, Sparkles, TrendingDown
} from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

interface PriceDropModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const PriceDropModal: React.FC<PriceDropModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { savePriceDropAlert, removePriceDropAlert, getUserPriceAlertForProduct } = useStore();
  const { currentUser, setIsAuthOpen } = useAuth() as any;

  const currentPrice = product.discountPrice ?? product.regularPrice;
  const existingAlert = currentUser ? getUserPriceAlertForProduct(product.id, currentUser.id) : undefined;

  // Default target price: 10% below current price rounded to nearest 10
  const defaultTarget = existingAlert ? existingAlert.targetPrice : Math.round((currentPrice * 0.9) / 10) * 10;

  const [targetPrice, setTargetPrice] = useState<number>(defaultTarget);
  const [notifyEmail, setNotifyEmail] = useState(existingAlert?.userEmail || currentUser?.email || '');
  const [notifyPhone, setNotifyPhone] = useState(existingAlert?.userPhone || currentUser?.phone || '');
  const [notifyVia, setNotifyVia] = useState<'both' | 'email' | 'sms'>(existingAlert?.notifyVia || 'both');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  // Preset quick discount suggestions
  const discountPresets = [
    { label: '৫% ছাড়', percent: 5, price: Math.round((currentPrice * 0.95) / 10) * 10 },
    { label: '১০% ছাড়', percent: 10, price: Math.round((currentPrice * 0.90) / 10) * 10 },
    { label: '১৫% ছাড়', percent: 15, price: Math.round((currentPrice * 0.85) / 10) * 10 },
    { label: '২০% ছাড়', percent: 20, price: Math.round((currentPrice * 0.80) / 10) * 10 },
  ];

  const savingsAmount = Math.max(0, currentPrice - targetPrice);
  const savingsPercent = Math.round((savingsAmount / currentPrice) * 100);

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onClose();
      return;
    }

    if (targetPrice <= 0) {
      setStatus('error');
      setStatusMessage('টার্গেট মূল্য শূন্যের চেয়ে বেশি হতে হবে।');
      return;
    }

    if (targetPrice >= currentPrice) {
      setStatus('error');
      setStatusMessage(`টার্গেট মূল্য বর্তমান মূল্যের (৳${currentPrice.toLocaleString()}) চেয়ে কম হতে হবে।`);
      return;
    }

    const result = savePriceDropAlert({
      userId: currentUser.id,
      productId: product.id,
      productNameEn: product.nameEn,
      productNameBn: product.nameBn,
      productImage: product.images[0],
      currentPriceAtSet: currentPrice,
      targetPrice: Number(targetPrice),
      userEmail: notifyEmail.trim() || undefined,
      userPhone: notifyPhone.trim() || undefined,
      notifyVia
    });

    if (result.success) {
      setStatus('success');
      setStatusMessage(result.message);
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1800);
    }
  };

  const handleRemoveAlert = () => {
    if (!existingAlert) return;
    if (confirm('আপনি কি এই পণ্যের মূল্য হ্রাস অ্যালার্টটি মুছে ফেলতে চান?')) {
      removePriceDropAlert(existingAlert.id);
      setStatus('success');
      setStatusMessage('অ্যালার্ট সফলভাবে প্রত্যাহার করা হয়েছে।');
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FFF9F2] text-[#2D1B22] rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#D9A441]/40 my-6 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#7A1238]/10">
          <div className="w-11 h-11 rounded-2xl bg-[#7A1238] text-[#F6E2B3] flex items-center justify-center shrink-0 shadow-sm">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D9A441]/20 text-[#7A1238] text-[10px] font-bold border border-[#D9A441]/40">
              <Sparkles className="w-3 h-3 text-[#D9A441]" />
              <span>স্মার্ট প্রাইস ট্র্যাকার · PREYOSHI SMART ALERT</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-bangla text-[#7A1238] mt-0.5">
              মূল্য হ্রাস নোটিফিকেশন সেট করুন
            </h3>
          </div>
        </div>

        {/* Product Quick View Card */}
        <div className="mt-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs flex items-center gap-3">
          <img
            src={product.images[0]}
            alt={product.nameEn}
            className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold font-bangla text-gray-900 truncate">
              {product.nameBn}
            </h4>
            <p className="text-[11px] text-gray-500 truncate">{product.nameEn}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-gray-500 font-bangla">বর্তমান মূল্য:</span>
              <span className="text-sm font-black text-[#7A1238]">৳{currentPrice.toLocaleString()}</span>
              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Existing Active Alert Banner */}
        {existingAlert && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bangla">
                ইতিমধ্যে সক্রিয় টার্গেট: <strong className="font-mono">৳{existingAlert.targetPrice.toLocaleString()}</strong>
              </span>
            </div>
            <button
              onClick={handleRemoveAlert}
              className="text-[11px] text-red-600 hover:text-red-700 font-bold underline cursor-pointer shrink-0 font-bangla"
            >
              বাতিল করুন
            </button>
          </div>
        )}

        {/* Success Message */}
        {status === 'success' ? (
          <div className="my-6 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-900 font-bangla">
              প্রাইস ড্রপ অ্যালার্ট সংরক্ষিত হয়েছে!
            </h4>
            <p className="text-xs text-emerald-800 font-bangla">{statusMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSaveAlert} className="mt-4 space-y-4">
            {/* Target Price Input */}
            <div>
              <label className="block text-xs font-bold text-gray-800 font-bangla mb-1">
                আপনার কাঙ্ক্ষিত টার্গেট মূল্য (BDT):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={currentPrice - 1}
                  required
                  value={targetPrice}
                  onChange={e => {
                    setTargetPrice(Number(e.target.value));
                    if (status === 'error') setStatus('idle');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white text-[#7A1238] font-mono font-black text-lg rounded-2xl border-2 border-gray-200 focus:border-[#7A1238] focus:outline-hidden transition-all shadow-xs"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#7A1238] text-base">
                  ৳
                </span>
              </div>
            </div>

            {/* Quick Percentage Presets */}
            <div>
              <span className="text-[11px] font-semibold text-gray-500 font-bangla block mb-1.5">
                দ্রুত ছাড় পার্সেন্টেজ নির্বাচন করুন:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {discountPresets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTargetPrice(preset.price);
                      if (status === 'error') setStatus('idle');
                    }}
                    className={`py-2 px-1.5 rounded-xl text-center text-xs transition-all cursor-pointer border ${
                      targetPrice === preset.price
                        ? 'bg-[#7A1238] text-white border-[#7A1238] font-bold shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-[#BE0750]'
                    }`}
                  >
                    <span className="block font-bangla font-bold">{preset.label}</span>
                    <span className="block font-mono text-[10px] opacity-80 mt-0.5">৳{preset.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Savings Callout */}
            {savingsAmount > 0 && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#F8E8E9] to-pink-50 border border-[#BE0750]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#BE0750]" />
                  <span className="font-bangla text-gray-800">
                    আনুমানিক সাশ্রয় হবে: <strong className="text-[#BE0750] font-black">৳{savingsAmount.toLocaleString()}</strong> ({savingsPercent}% ছাড়)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#BE0750] text-white text-[10px] font-bold">
                  সাশ্রয়ী ডিল
                </span>
              </div>
            )}

            {/* Notification Channels */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-gray-800 font-bangla block">
                যেখানে নোটিফিকেশন পেতে চান:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 font-bangla mb-1">
                    ইমেইল ঠিকানা:
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={e => setNotifyEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-gray-200 focus:border-[#7A1238] focus:outline-hidden"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 font-bangla mb-1">
                    মোবাইল নম্বর (এসএমএস / WhatsApp):
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={notifyPhone}
                      onChange={e => setNotifyPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-gray-200 focus:border-[#7A1238] focus:outline-hidden"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Notification method select */}
              <div className="flex items-center gap-4 text-xs font-bangla text-gray-700 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="notifyVia"
                    checked={notifyVia === 'both'}
                    onChange={() => setNotifyVia('both')}
                    className="text-[#7A1238]"
                  />
                  <span>উভয় মাধ্যম (ইমেইল + এসএমএস)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="notifyVia"
                    checked={notifyVia === 'email'}
                    onChange={() => setNotifyVia('email')}
                    className="text-[#7A1238]"
                  />
                  <span>শুধুমাত্র ইমেইল</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="notifyVia"
                    checked={notifyVia === 'sms'}
                    onChange={() => setNotifyVia('sms')}
                    className="text-[#7A1238]"
                  />
                  <span>শুধুমাত্র এসএমএস</span>
                </label>
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 text-xs font-bangla">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="submit"
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#7A1238] via-[#8C1641] to-[#BE0750] hover:brightness-105 text-white font-bold text-xs sm:text-sm font-bangla transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-4 h-4 text-[#F6E2B3]" />
                <span>{existingAlert ? 'টার্গেট মূল্য আপডেট করুন' : 'অ্যালার্ট সংরক্ষণ করুন'}</span>
              </button>

              {existingAlert && (
                <button
                  type="button"
                  onClick={handleRemoveAlert}
                  className="py-3 px-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer border border-red-200"
                  title="অ্যালার্ট বাতিল করুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-[10px] text-gray-500 text-center font-bangla flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>মূল্য আপনার টার্গেটে নামলে তাৎক্ষণিকভাবে স্বয়ংক্রিয় মেসেজ পাঠানো হবে।</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
