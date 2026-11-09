import React, { useState } from 'react';
import {
  Award, Sparkles, Gift, TrendingUp, CheckCircle2, Copy, Check,
  Clock, ArrowRight, ShieldCheck, Tag, AlertCircle, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const LoyaltySection: React.FC = () => {
  const { currentUser, earnPoints, redeemPoints } = useAuth();
  const { coupons, applyCoupon, setIsProfileOpen, setIsCartOpen, setCurrentView } = useStore();

  const [customAmount, setCustomAmount] = useState<string>('');
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; couponCode?: string } | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  const points = currentUser?.loyaltyPoints ?? 0;
  const tier = currentUser?.loyaltyTier ?? 'Bronze';
  const history = currentUser?.loyaltyHistory ?? [];

  // Tier calculation progress
  const getNextTierInfo = () => {
    if (points >= 1000) {
      return { nextTier: 'Supreme VIP', needed: 0, percent: 100 };
    }
    if (points >= 500) {
      return { nextTier: 'Platinum', needed: 1000 - points, percent: Math.round((points / 1000) * 100) };
    }
    if (points >= 250) {
      return { nextTier: 'Gold', needed: 500 - points, percent: Math.round(((points - 250) / 250) * 100) };
    }
    return { nextTier: 'Silver', needed: 250 - points, percent: Math.round((points / 250) * 100) };
  };

  const nextTierInfo = getNextTierInfo();

  const handleClaimVoucher = (amount: number, voucherTitle: string) => {
    if (points < amount) {
      setFeedback({
        success: false,
        message: `এই ভাউচারের জন্য আপনার আরও ${amount - points} পয়েন্ট প্রয়োজন!`
      });
      return;
    }

    const res = redeemPoints(amount, `${voucherTitle} রিডিম`);
    if (res.success) {
      // Generate unique coupon code
      const uniqueCode = `PREYOSHI-${amount}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      // Auto-apply this voucher to store context
      applyCoupon(uniqueCode);

      setFeedback({
        success: true,
        message: `অভিনন্দন! ৳${amount} সমমূল্যের ভাউচার সক্রিয় করা হয়েছে এবং কার্ট-এ অ্যাপ্লাই করা হয়েছে!`,
        couponCode: uniqueCode
      });
    } else {
      setFeedback({ success: false, message: res.message });
    }
  };

  const handleCustomRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customAmount, 10);
    if (isNaN(parsed) || parsed < 50) {
      setFeedback({ success: false, message: 'সর্বনিম্ন ৫০ পয়েন্ট রিডিম করা যাবে।' });
      return;
    }
    if (parsed > points) {
      setFeedback({ success: false, message: 'আপনার অ্যাকাউন্টে পর্যাপ্ত পয়েন্ট নেই।' });
      return;
    }

    handleClaimVoucher(parsed, `৳${parsed} কাস্টম পয়েন্ট ক্যাশ ভাউচার`);
    setCustomAmount('');
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const getTierBadgeColor = (t: string) => {
    switch (t) {
      case 'Platinum':
        return 'bg-gradient-to-r from-slate-900 to-indigo-900 text-amber-300 border-amber-300/40';
      case 'Gold':
        return 'bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-yellow-200';
      case 'Silver':
        return 'bg-gradient-to-r from-slate-600 to-zinc-400 text-white border-zinc-200';
      default:
        return 'bg-gradient-to-r from-amber-800 to-amber-700 text-amber-100 border-amber-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Grand Loyalty Membership Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7A1238] via-[#8C1641] to-[#BE0750] p-6 text-white shadow-xl border border-[#D9A441]/30">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 pointer-events-none blur-xl" />
        <div className="absolute top-0 right-0 p-6 opacity-15 pointer-events-none">
          <Award className="w-32 h-32 text-[#D9A441]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#F6E2B3] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Preyoshi Privileges
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierBadgeColor(tier)}`}>
                  ★ {tier} Member
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-bangla text-white">
                প্রেয়সী লয়্যালটি রিওয়ার্ডস
              </h3>
              <p className="text-xs text-white/80 font-bangla">
                আপনার প্রতিটি অর্ডারে পাচ্ছেন নিশ্চিত ক্যাশব্যাক পয়েন্ট
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#F6E2B3] block">
                বর্তমান পয়েন্ট ব্যালেন্স
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#F6E2B3] font-mono drop-shadow-sm">
                {points.toLocaleString()} <span className="text-sm font-bangla font-normal text-white">পয়েন্ট</span>
              </div>
              <span className="text-xs text-emerald-300 font-bold font-bangla">
                = ৳{points.toLocaleString()} সমমূল্য
              </span>
            </div>
          </div>

          {/* Tier Progress */}
          <div className="bg-black/20 p-3.5 rounded-2xl backdrop-blur-xs border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bangla flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
                <span>বর্তমান টিয়ার: <strong>{tier}</strong></span>
              </span>
              {points < 1000 ? (
                <span className="text-[11px] text-[#F6E2B3] font-bangla">
                  পরবর্তী টিয়ার: <strong>{nextTierInfo.nextTier}</strong> (আর {nextTierInfo.needed} পয়েন্ট বাকি)
                </span>
              ) : (
                <span className="text-[11px] text-amber-300 font-bold">
                  আপনি সর্বোচ্চ ভিআইপি টিয়ারে আছেন!
                </span>
              )}
            </div>

            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#D9A441] to-yellow-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, nextTierInfo.percent))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bangla flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-slide-up ${
          feedback.success
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>

          {feedback.couponCode && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <code className="bg-white px-2.5 py-1 rounded-lg border border-emerald-300 font-mono font-bold text-emerald-700">
                {feedback.couponCode}
              </code>
              <button
                onClick={() => handleCopyCoupon(feedback.couponCode!)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedCoupon === feedback.couponCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCoupon === feedback.couponCode ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. Redemption Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-gray-900 font-bangla flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#BE0750]" />
            <span>পয়েন্ট রিডিম অপশন (Redemption Vouchers)</span>
          </h4>
          <span className="text-[11px] text-gray-500 font-bangla">১ পয়েন্ট = ১ টাকা ডিসকাউন্ট</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: 100 Points */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#BE0750] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-[#F8E8E9] text-[#7A1238] font-bold text-xs px-2.5 py-0.5 rounded-md font-bangla">
                  ১০০ পয়েন্ট
                </span>
                <Tag className="w-3.5 h-3.5 text-[#D9A441]" />
              </div>
              <h5 className="font-bold text-base text-gray-900 mt-2 font-bangla">
                ৳১০০ ক্যাশ ভাউচার
              </h5>
              <p className="text-[11px] text-gray-500 font-bangla mt-0.5">
                যেকোনো অর্ডারে ১০০ টাকা সরাসরি ছাড়
              </p>
            </div>

            <button
              onClick={() => handleClaimVoucher(100, '৳১০০ ডিসকাউন্ট ভাউচার')}
              disabled={points < 100}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                points >= 100
                  ? 'bg-[#7A1238] hover:bg-[#BE0750] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{points >= 100 ? 'ভাউচার নিন' : 'পয়েন্ট কম আছে'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: 250 Points */}
          <div className="bg-white p-4 rounded-2xl border-2 border-[#BE0750]/30 hover:border-[#BE0750] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden">
            <span className="absolute -right-8 top-3 bg-[#BE0750] text-white text-[9px] font-bold px-8 py-0.5 rotate-45">
              জনপ্রিয়
            </span>
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-[#BE0750]/15 text-[#BE0750] font-bold text-xs px-2.5 py-0.5 rounded-md font-bangla">
                  ২৫০ পয়েন্ট
                </span>
                <Tag className="w-3.5 h-3.5 text-[#BE0750]" />
              </div>
              <h5 className="font-bold text-base text-[#7A1238] mt-2 font-bangla">
                ৳২৫০ ক্যাশ ভাউচার
              </h5>
              <p className="text-[11px] text-gray-500 font-bangla mt-0.5">
                যেকোনো অর্ডারে ২৫০ টাকা সরাসরি ছাড়
              </p>
            </div>

            <button
              onClick={() => handleClaimVoucher(250, '৳২৫০ ডিসকাউন্ট ভাউচার')}
              disabled={points < 250}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                points >= 250
                  ? 'bg-[#BE0750] hover:bg-[#7A1238] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{points >= 250 ? 'ভাউচার নিন' : 'পয়েন্ট কম আছে'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: 500 Points */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 hover:border-[#D9A441] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-[#D9A441]/15 text-[#916518] font-bold text-xs px-2.5 py-0.5 rounded-md font-bangla">
                  ৫০০ পয়েন্ট
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
              </div>
              <h5 className="font-bold text-base text-gray-900 mt-2 font-bangla">
                ৳৫০০ ভিআইপি ভাউচার
              </h5>
              <p className="text-[11px] text-gray-500 font-bangla mt-0.5">
                যেকোনো অর্ডারে ৫০০ টাকা মেগা ক্যাশব্যাক
              </p>
            </div>

            <button
              onClick={() => handleClaimVoucher(500, '৳৫০০ ভিআইপি মেগা ভাউচার')}
              disabled={points < 500}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                points >= 500
                  ? 'bg-gradient-to-r from-[#D9A441] to-[#b37f26] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{points >= 500 ? 'ভিআইপি ভাউচার নিন' : 'পয়েন্ট কম আছে'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Custom Redemption Form */}
        <form
          onSubmit={handleCustomRedeem}
          className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        >
          <div className="flex-1">
            <span className="font-bold text-gray-800 font-bangla block">
              কাস্টম পয়েন্ট রিডিম করুন:
            </span>
            <span className="text-[11px] text-gray-500 font-bangla">
              আপনার ইচ্ছামত পয়েন্ট দিয়ে কার্ট-এ সরাসরি ছাড় তৈরি করুন (নূন্যতম ৫০ পয়েন্ট)
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min="50"
              max={points}
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              placeholder="পয়েন্ট লিখুন (যেমন: 150)"
              className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:border-[#BE0750] w-36 font-mono"
            />
            <button
              type="submit"
              disabled={!customAmount || points < 50}
              className="px-4 py-2 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold transition-colors disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer shrink-0"
            >
              রিডিম করুন
            </button>
          </div>
        </form>
      </div>

      {/* 3. How to Earn Points Guide */}
      <div className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#7A1238]/15 space-y-2">
        <h5 className="font-bold text-xs text-[#7A1238] font-bangla flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#BE0750]" />
          <span>পয়েন্ট অর্জনের নিয়মাবলী (How to Earn):</span>
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-gray-700 font-bangla">
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#F8E8E9] text-[#7A1238] flex items-center justify-center font-bold text-[10px]">১</span>
            <span>প্রতি ৳২০ কেনাকাটায় <strong>১ পয়েন্ট</strong> নিশ্চিত উপহার</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#F8E8E9] text-[#7A1238] flex items-center justify-center font-bold text-[10px]">২</span>
            <span>১ পয়েন্ট = <strong>১ টাকা</strong> ডিসকাউন্ট ভাউচার</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#F8E8E9] text-[#7A1238] flex items-center justify-center font-bold text-[10px]">৩</span>
            <span>উচ্চতর টিয়ারে <strong>১.৫x গুণ</strong> দ্রুত পয়েন্ট বৃদ্ধি</span>
          </div>
        </div>
      </div>

      {/* 4. Points Transaction History */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-gray-900 font-bangla flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>পয়েন্ট লেনদেন ইতিহাস (Points Ledger)</span>
        </h4>

        {history.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-500 font-bangla">
            এখনও কোনো পয়েন্ট লেনদেন রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs divide-y divide-gray-100 max-h-60 overflow-y-auto">
            {history.map(item => (
              <div key={item.id} className="p-3 sm:px-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    item.type === 'earned'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-[#F8E8E9] text-[#7A1238]'
                  }`}>
                    {item.type === 'earned' ? '+' : '-'}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-gray-800 font-bangla truncate">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.date).toLocaleDateString('bn-BD', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                      {item.orderNumber && ` · #${item.orderNumber}`}
                    </span>
                  </div>
                </div>

                <div className={`font-mono font-bold text-sm shrink-0 ${
                  item.type === 'earned' ? 'text-emerald-700' : 'text-[#BE0750]'
                }`}>
                  {item.type === 'earned' ? `+${item.amount}` : `-${item.amount}`} pts
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
