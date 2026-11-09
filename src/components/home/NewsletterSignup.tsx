import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Mail, Sparkles, Gift, Tag, Copy, Check, CheckCircle2,
  AlertCircle, ArrowRight, ShieldCheck, Heart, User, Phone,
  Flame, Crown, Zap, Send, ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const NewsletterSignup: React.FC = () => {
  const {
    subscribeNewsletter,
    applyCoupon,
    setIsCartOpen,
    newsletterSubscribers
  } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ couponCode: string; message: string; isNew: boolean } | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  // Email regex validation
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setStatus('error');
      setErrorMessage('অনুগ্রহ করে আপনার সঠিক ইমেইল ঠিকানা প্রদান করুন।');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setStatus('error');
      setErrorMessage('সঠিক ইমেইল ফরম্যাট দিন (যেমন: customer@example.com)।');
      return;
    }

    if (phone.trim() && !/^(\+?880|0)?1[3-9]\d{8}$/.test(phone.trim().replace(/[-\s]/g, ''))) {
      setStatus('error');
      setErrorMessage('সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    setStatus('loading');

    setTimeout(() => {
      const result = subscribeNewsletter(cleanEmail, name.trim() || undefined, phone.trim() || undefined);

      if (result.success) {
        setStatus('success');
        setSuccessInfo({
          couponCode: result.couponCode,
          message: result.message,
          isNew: result.isNew
        });
        setErrorMessage('');

        // Celebratory confetti shower
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.8 },
            colors: ['#7A1238', '#BE0750', '#D9A441', '#FFF9F2', '#F8E8E9']
          });
        } catch {
          // ignore if canvas-confetti is not loaded
        }
      } else {
        setStatus('error');
        setErrorMessage('সাবস্ক্রিপশন সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    }, 400);
  };

  const handleCopyCoupon = () => {
    if (!successInfo?.couponCode) return;
    navigator.clipboard?.writeText(successInfo.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyToCart = () => {
    if (!successInfo?.couponCode) return;
    applyCoupon(successInfo.couponCode);
    setApplied(true);
    setIsCartOpen(true);
    setTimeout(() => setApplied(false), 3000);
  };

  const handleResetForm = () => {
    setStatus('idle');
    setEmail('');
    setName('');
    setPhone('');
    setSuccessInfo(null);
  };

  // Dynamic subscriber counter (starts at base + actual stored count)
  const subscriberDisplayCount = 1280 + newsletterSubscribers.length;

  return (
    <section className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFF9F2] via-[#F8E8E9] to-[#FFF9F2] overflow-hidden">
      {/* Decorative background radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#BE0750]/15 to-[#D9A441]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#7A1238]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7A1238] via-[#5C0D27] to-[#3B0718] text-white shadow-2xl border-2 border-[#D9A441]/40 p-6 sm:p-10 md:p-14">
          {/* Subtle ornate gold border accent */}
          <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />
          
          {/* Watermark brand icon */}
          <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none">
            <Gift className="w-80 h-80 text-[#D9A441]" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Compelling copy & VIP benefits */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 border border-[#D9A441]/60 text-[#F6E2B3] text-xs font-semibold backdrop-blur-sm shadow-xs">
                <Crown className="w-3.5 h-3.5 text-[#D9A441] animate-pulse" />
                <span className="font-bangla font-bold">PREYOSHI VIP CLUB · বিশেষ স্বাগতম অফার</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441]" />
                <span className="text-[11px] text-white/80">সীমিত সময়ের সুযোগ</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold font-bangla text-white leading-tight">
                  নিউজলেটারে যুক্ত হোন — সাথে সাথেই পান{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6E2B3] via-[#D9A441] to-amber-200 underline decoration-[#D9A441]/60 decoration-wavy decoration-1">
                    ১০% ডিসকাউন্ট ভাউচার!
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-white/85 font-bangla leading-relaxed max-w-xl">
                  প্রেয়সী শপের এক্সক্লুসিভ কালেকশন, নতুন ঢাকাই জামদানি শাড়ি ও কুন্দন জুয়েলারি রিলিজের খবর সবার আগে পেতে আজই সাবস্ক্রাইব করুন। প্রথম অর্ডারে পাবেন নিশ্চিত ছাড়।
                </p>
              </div>

              {/* VIP Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#D9A441]/20 flex items-center justify-center shrink-0 text-[#D9A441]">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-bangla">১০% ফ্ল্যাট ভাউচার</h4>
                    <p className="text-[11px] text-white/70 font-bangla">ফর্ম জমা দিলেই কোড স্ক্রিনে আনলক হবে</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#BE0750]/30 flex items-center justify-center shrink-0 text-pink-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-bangla">আর্লি ভিআইপি অ্যাক্সেস</h4>
                    <p className="text-[11px] text-white/70 font-bangla">নতুন ঈদ কালেকশন ও স্পেশাল ছাড় সবার আগে</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 flex items-center justify-center shrink-0 text-amber-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-bangla">গোপন ফ্ল্যাশ সেল</h4>
                    <p className="text-[11px] text-white/70 font-bangla">অনলি-সাবস্ক্রাইবার প্রাইভেট ডিসকাউন্ট ডিল</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-bangla">১০০% স্প্যাম-মুক্ত</h4>
                    <p className="text-[11px] text-white/70 font-bangla">যেকোনো সময় চাইলে আনসাবস্ক্রাইব করতে পারবেন</p>
                  </div>
                </div>
              </div>

              {/* Social Proof Counter */}
              <div className="flex items-center gap-3 pt-2 text-xs text-white/75 font-bangla">
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#7A1238] object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80" alt="Customer" />
                  <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#7A1238] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Customer" />
                  <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#7A1238] object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80" alt="Customer" />
                </div>
                <span>
                  <strong className="text-[#D9A441] font-bold">{subscriberDisplayCount.toLocaleString('bn-BD')}+</strong> জন ফ্যাশনপ্রেমী গ্রাহক ইতিমধ্যে যুক্ত হয়েছেন
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Subscription Form OR Unlocked Voucher Ticket */}
            <div className="lg:col-span-5">
              {status === 'success' && successInfo ? (
                /* Unlocked Voucher Card with Ticket Styling */
                <div className="relative bg-white text-gray-900 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-[#D9A441] animate-in fade-in zoom-in-95 duration-300">
                  {/* Ticket top notch */}
                  <div className="text-center space-y-2 pb-4 border-b border-dashed border-gray-300 relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto shadow-inner">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold font-bangla text-[#7A1238]">
                      অভিনন্দন! আপনার কুপন আনলক হয়েছে
                    </h3>
                    <p className="text-xs text-gray-600 font-bangla">
                      {successInfo.message}
                    </p>
                  </div>

                  {/* Golden Coupon Ticket Body */}
                  <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-[#F8E8E9] via-pink-50 to-[#F8E8E9] border-2 border-dashed border-[#BE0750]/40 text-center space-y-1.5 relative overflow-hidden">
                    <div className="absolute top-1 right-2 text-[10px] font-bold uppercase tracking-wider text-[#7A1238] font-mono bg-white/80 px-2 py-0.5 rounded-md border border-[#BE0750]/20">
                      ১০% ছাড়
                    </div>

                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block font-sans">
                      DISCOUNT PROMO CODE
                    </span>

                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#7A1238] py-1 select-all">
                      {successInfo.couponCode}
                    </div>

                    <span className="text-xs text-stone-600 font-bangla block">
                      ন্যূনতম ৳১,০০০ টাকার যেকোনো শপিংয়ে ১০% ইনস্ট্যান্ট ডিসকাউন্ট
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleCopyCoupon}
                        className="py-3 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-gray-200 active:scale-95"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 font-bangla">কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 text-[#7A1238]" />
                            <span className="font-bangla">কোড কপি করুন</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleApplyToCart}
                        className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#7A1238] to-[#BE0750] hover:from-[#8C1641] hover:to-[#CF0E5B] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 group"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#F6E2B3] group-hover:scale-110 transition-transform" />
                        <span className="font-bangla">{applied ? 'যুক্ত হয়েছে!' : 'কার্ট-এ লাগান'}</span>
                      </button>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        onClick={handleResetForm}
                        className="text-xs text-gray-500 hover:text-[#7A1238] underline font-bangla transition-colors cursor-pointer"
                      >
                        অন্য কোনো ইমেইল বা ফোন দিয়ে যুক্ত হতে চান? এখানে ক্লিক করুন
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Interactive Signup Form */
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30 text-gray-900">
                  <div className="text-center pb-5 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7A1238] font-serif-brand">
                      VIP NEWSLETTER SIGNUP
                    </span>
                    <h3 className="text-xl font-bold font-bangla text-gray-900">
                      নিচের তথ্য দিয়ে কুপন আনলক করুন
                    </h3>
                    <p className="text-xs text-gray-500 font-bangla">
                      এক ক্লিকেই আপনার ইনবক্স ও স্ক্রিনে কোড পৌঁছে যাবে
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {/* Name Input (Optional) */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 font-bangla mb-1">
                        আপনার নাম (ঐচ্ছিক)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="উদাঃ নুসরাত জাহান"
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#7A1238] focus:bg-white focus:outline-hidden transition-all font-bangla"
                        />
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Email Input (Required) */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 font-bangla mb-1">
                        ইমেইল ঠিকানা <span className="text-[#BE0750]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={e => {
                            setEmail(e.target.value);
                            if (status === 'error') setStatus('idle');
                          }}
                          placeholder="name@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-[#7A1238] focus:bg-white focus:outline-hidden transition-all font-sans"
                        />
                        <Mail className="w-4 h-4 text-[#7A1238] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Phone Number Input (Optional) */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 font-bangla mb-1">
                        মোবাইল নম্বর (ঐচ্ছিক - এসএমএস অফারের জন্য)
                      </label>
                      <div className="relative flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-gray-600 text-xs font-mono">
                          🇧🇩 +880
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="17XXXXXXXX"
                          className="w-full pl-3 pr-4 py-2.5 bg-gray-50 text-gray-900 text-xs sm:text-sm rounded-r-xl border border-gray-200 focus:border-[#7A1238] focus:bg-white focus:outline-hidden transition-all font-mono"
                        />
                      </div>
                    </div>

                    {/* Error Feedback */}
                    {status === 'error' && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bangla">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Submit CTA Button */}
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D9A441] via-amber-400 to-[#D9A441] hover:brightness-105 active:scale-[0.98] text-stone-900 font-extrabold text-sm sm:text-base font-bangla transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
                    >
                      {status === 'loading' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                          <span>যাচাই করা হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <span>সাবস্ক্রাইব করুন এবং কুপন পান</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>

                    <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-bangla text-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>আমরা আপনার গোপনীয়তাকে সম্মান করি। কোনো স্প্যাম নেই।</span>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
