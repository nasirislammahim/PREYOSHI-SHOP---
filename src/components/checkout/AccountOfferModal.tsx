import React from 'react';
import { Gift, ShieldCheck, Sparkles, X, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

interface AccountOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedAsGuest: () => void;
  onCreateAccount: () => void;
  couponCode?: string;
}

export const AccountOfferModal: React.FC<AccountOfferModalProps> = ({
  isOpen,
  onClose,
  onProceedAsGuest,
  onCreateAccount,
  couponCode = 'WELCOME10'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 relative overflow-hidden animate-scale-up">
        {/* Background Decorative Gradient */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-[#BE0750]/20 to-[#D9A441]/20 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7A1238] to-[#BE0750] flex items-center justify-center text-white shadow-lg ring-4 ring-[#FFF9F2]">
            <Gift className="w-7 h-7 text-[#D9A441] animate-bounce" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <span className="text-[11px] font-bold text-[#BE0750] uppercase tracking-wider font-serif-brand">
            Wait! A Special Gift for You!
          </span>
          <h3 className="text-xl font-bold font-bangla text-[#2A101A] mt-1">
            অপেক্ষা করুন! আপনার জন্য বিশেষ উপহার!
          </h3>
          <p className="text-xs text-gray-600 font-bangla mt-2 leading-relaxed">
            এখনই মাত্র ১০ সেকেন্ডে ফ্রি অ্যাকাউন্ট তৈরি করে অর্ডার সম্পন্ন করলে পাচ্ছেন বিশেষ সুবিধা ও উপহার:
          </p>

          {/* Benefit Cards */}
          <div className="my-4 space-y-2.5 text-left text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFF9F2] border border-[#D9A441]/30">
              <Sparkles className="w-4 h-4 text-[#D9A441] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block font-bangla">১০০ পয়েন্ট স্বাগতম বোনাস ও কুপন</span>
                <span className="text-[11px] text-gray-600">
                  কুপন কোড <strong className="font-mono text-[#7A1238] bg-white px-1.5 py-0.5 rounded border border-gray-200">{couponCode}</strong> ব্যবহারে ১০% ছাড়
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/50 border border-rose-100">
              <ShieldCheck className="w-4 h-4 text-[#BE0750] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block font-bangla">লাইভ অর্ডার ট্র্যাকিং ও হিস্ট্রি সংরক্ষণ</span>
                <span className="text-[11px] text-gray-600">যেকোনো ডিভাইস থেকে ডেলিভারি স্ট্যাটাস দেখা ও সহজে রি-অর্ডার সুবিধা</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 block font-bangla">যাচাইকৃত ক্রেতা ব্যাজ (Verified Buyer)</span>
                <span className="text-[11px] text-gray-600">পণ্য গ্রহণ শেষে ছবিসহ প্রিমিয়াম ভেরিফাইড রিভিউ দেওয়ার সুযোগ</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={onCreateAccount}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7A1238] to-[#BE0750] hover:from-[#5C0D2A] hover:to-[#A30644] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>অ্যাকাউন্ট তৈরি করুন ও উপহার নিন</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onProceedAsGuest}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              বিনা অ্যাকাউন্টে অর্ডার সম্পন্ন করুন (Continue as Guest)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
