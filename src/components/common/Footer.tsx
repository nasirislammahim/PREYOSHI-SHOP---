import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Phone, Mail, MapPin, MessageCircle, Heart, Shield,
  Truck, RotateCcw, Clock, ExternalLink, Sparkles, CheckCircle2,
  Copy, Check, AlertCircle, Send, Gift, Tag, ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../brand/BrandLogo';

export const Footer: React.FC = () => {
  const {
    settings,
    categories,
    setSelectedCategory,
    setCurrentView,
    setActivePolicyModal,
    applyCoupon,
    setIsCartOpen,
    subscribeNewsletter
  } = useStore();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [couponCode, setCouponCode] = useState('WELCOME10');
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  // Standard email validation pattern
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!trimmed) {
      setStatus('error');
      setErrorMessage('দয়া করে আপনার ইমেইল অ্যাড্রেস লিখুন।');
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus('error');
      setErrorMessage('সঠিক ফরম্যাটের কার্যকর ইমেইল প্রদান করুন (যেমন: user@example.com)।');
      return;
    }

    // Save subscriber to centralized customer database in StoreContext
    const res = subscribeNewsletter(trimmed);
    if (res.couponCode) {
      setCouponCode(res.couponCode);
    }

    setStatus('success');
    setErrorMessage('');


    // Trigger celebratory confetti
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.85 },
      colors: ['#7A1238', '#BE0750', '#D9A441', '#FFF9F2']
    });
  };

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyCouponToCart = () => {
    applyCoupon(couponCode);
    setApplied(true);
    setIsCartOpen(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <footer className="bg-[#2A101A] text-white pt-12 pb-8 border-t-4 border-[#D9A441]">
      {/* 1. Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BE0750]/20 flex items-center justify-center shrink-0 text-[#D9A441]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold font-bangla">সারা বাংলাদেশে ডেলিভারি</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">ক্যাশ অন ডেলিভারি সুবিধা ও দ্রুত পার্সেল হ্যান্ডলিং</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BE0750]/20 flex items-center justify-center shrink-0 text-[#D9A441]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold font-bangla">১০০% আসল ও কোয়ালিটি পণ্য</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">প্রতিটি পণ্যের গুণগত মান সরাসরি যাচাইকৃত</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BE0750]/20 flex items-center justify-center shrink-0 text-[#D9A441]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold font-bangla">সহজ রিটার্ন পলিসি</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">৭ দিনের মধ্যে নিরাপদ রিটার্ন ও এক্সচেঞ্জ গ্যারান্টি</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BE0750]/20 flex items-center justify-center shrink-0 text-[#D9A441]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold font-bangla">ডেডিকেটেড কাস্টমার সাপোর্ট</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">সকাল ৯টা - রাত ১১টা পর্যন্ত সার্বক্ষণিক সেবা</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Exclusive VIP Newsletter & Welcome Discount Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-b border-white/10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7A1238] via-[#8C1641] to-[#BE0750] p-6 sm:p-8 border border-[#D9A441]/40 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/5 pointer-events-none blur-2xl" />
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Gift className="w-36 h-36 text-[#D9A441]" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Title & Promotional Pitch */}
            <div className="lg:col-span-7 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 border border-[#D9A441]/50 text-[#F6E2B3] text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
                <span className="font-bangla">PREYOSHI VIP CLUB · প্রথম অর্ডারে বিশেষ উপহার</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-bangla text-white leading-tight">
                নিউজলেটারে যুক্ত হোন — পান নিশ্চিত ১০% ডিসকাউন্ট ভাউচার!
              </h3>
              <p className="text-xs sm:text-sm text-white/85 font-bangla leading-relaxed max-w-xl">
                প্রেয়সী শপের নতুন কালেকশন, ফ্ল্যাশ সেল ও এক্সক্লুসিভ অফারের আপডেট পেতে ইমেইল সাবস্ক্রাইব করুন। নিবন্ধনের সাথে সাথেই পাবেন বিশেষ ডিসকাউন্ট কোড।
              </p>
            </div>

            {/* Newsletter Interactive Form / Success Card */}
            <div className="lg:col-span-5">
              {status === 'success' ? (
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 text-gray-900 border-2 border-[#D9A441] shadow-xl animate-slide-up space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs font-bangla">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>অভিনন্দন! আপনি সফলভাবে নিবন্ধিত হয়েছেন।</span>
                  </div>

                  <div className="p-3 bg-[#F8E8E9]/80 rounded-xl border border-[#BE0750]/30 space-y-1 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1238] block font-serif-brand">
                      আপনার ১০% ছাড়ের ডিসকাউন্ট কোড:
                    </span>
                    <div className="text-xl font-extrabold font-mono text-[#7A1238] tracking-widest">
                      {couponCode}
                    </div>
                    <span className="text-[11px] text-gray-500 font-bangla block">
                      ন্যূনতম ৳১,০০০ টাকার অর্ডারে ১০% ইন্সট্যান্ট ডিসকাউন্ট
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleCopyCoupon}
                      className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'কপি হয়েছে!' : 'কোড কপি করুন'}</span>
                    </button>

                    <button
                      onClick={handleApplyCouponToCart}
                      className="py-2 px-3 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Tag className="w-3.5 h-3.5 text-[#F6E2B3]" />
                      <span>{applied ? 'অ্যাপ্লাইড!' : 'কার্ট-এ লাগান'}</span>
                    </button>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      onClick={() => {
                        setStatus('idle');
                        setEmail('');
                      }}
                      className="text-[11px] text-gray-500 hover:text-[#7A1238] underline font-bangla cursor-pointer"
                    >
                      অন্য ইমেইল দিয়ে সাবস্ক্রাইব করুন
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      placeholder="আপনার ইমেইল অ্যাড্রেস লিখুন (e.g. name@gmail.com)"
                      className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 placeholder:text-gray-400 text-xs sm:text-sm rounded-2xl border-2 border-white/30 focus:border-[#D9A441] focus:outline-hidden shadow-lg transition-all font-sans"
                    />
                    <Mail className="w-4 h-4 text-[#7A1238] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-1.5 text-red-200 text-xs font-bangla px-1 animate-fade-in">
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-2xl bg-[#D9A441] hover:bg-yellow-400 text-stone-900 font-extrabold text-xs sm:text-sm font-bangla transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>সাবস্ক্রাইব করুন এবং কুপন পান</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-[10px] text-white/70 text-center font-bangla pt-1">
                    🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ। আমরা কোনো স্প্যাম ইমেইল পাঠাই না।
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" variant="light" />
            <p className="text-xs text-gray-300 leading-relaxed font-bangla max-w-sm">
              প্রেয়সী শপ বাংলাদেশের নারীদের ফ্যাশন, শাড়ি, ঐতিহ্যবাহী ঢাকাই জামদানি, এক্সক্লুসিভ কুন্দন জুয়েলারি ও লাইফস্টাইলের বিশ্বস্ত অনলাইন শপিং ঠিকানা।
            </p>
            <div className="pt-2 text-xs text-[#D9A441] font-medium flex items-center gap-1.5">
              <span>Brand Identity & Design by:</span>
              <strong className="text-white bg-[#BE0750]/40 px-2 py-0.5 rounded-sm">Nurtaz Agency</strong>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#1565C0] flex items-center justify-center text-white transition-colors text-sm font-bold shadow-xs"
                title="Follow Preyoshi Shop on Facebook"
              >
                f
              </a>
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] flex items-center justify-center text-white transition-colors shadow-xs"
                title="Message on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`tel:${settings.supportPhone}`}
                className="w-9 h-9 rounded-full bg-[#BE0750] hover:bg-[#9c0641] flex items-center justify-center text-white transition-colors shadow-xs"
                title="Call Support Hotline"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-bold text-[#D9A441] uppercase tracking-wider mb-3 font-serif-brand">
              ক্যাটাগরি
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setCurrentView('store');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#F6E2B3] transition-colors font-bangla cursor-pointer"
                  >
                    {cat.nameBn} ({cat.nameEn})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-sm font-bold text-[#D9A441] uppercase tracking-wider mb-3 font-serif-brand">
              গ্রাহক সেবা
            </h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button
                  onClick={() => setActivePolicyModal('contact')}
                  className="hover:text-[#F6E2B3] transition-colors cursor-pointer"
                >
                  যোগাযোগ (Contact Us)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('faq')}
                  className="hover:text-[#F6E2B3] transition-colors cursor-pointer"
                >
                  সাধারণ জিজ্ঞাসা (FAQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('return_policy')}
                  className="hover:text-[#F6E2B3] transition-colors cursor-pointer"
                >
                  রিটার্ন ও রিফান্ড পলিসি
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('privacy')}
                  className="hover:text-[#F6E2B3] transition-colors cursor-pointer"
                >
                  গোপনীয়তা নীতি (Privacy Policy)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicyModal('terms')}
                  className="hover:text-[#F6E2B3] transition-colors cursor-pointer"
                >
                  শর্তাবলী (Terms & Conditions)
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information & Official Address */}
          <div>
            <h4 className="text-sm font-bold text-[#D9A441] uppercase tracking-wider mb-3 font-serif-brand">
              অফিস ঠিকানা
            </h4>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D9A441] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{settings.supportAddress}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D9A441] shrink-0" />
                <a href={`tel:${settings.supportPhone}`} className="hover:text-white transition-colors">
                  {settings.supportPhone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D9A441] shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition-colors">
                  {settings.supportEmail}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#F6E2B3] hover:underline"
                >
                  <span>facebook.com/Preyoshishop</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar & Bangladesh Payment Methods */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1 font-bangla text-center sm:text-left">
          <span>© {new Date().getFullYear()} PREYOSHI SHOP (প্রেয়সী শপ). সর্বস্বত্ব সংরক্ষিত। Your Style</span>
          <Heart className="w-3.5 h-3.5 text-[#BE0750] fill-current inline mx-0.5" />
          <span>Our Priority.</span>
        </div>

        {/* Payment Partner Icons */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="text-[11px] text-gray-400 font-medium mr-1">পেমেন্ট মেথড:</span>
          <span className="px-2 py-0.5 bg-white text-[#2A101A] font-bold text-[10px] rounded-md shadow-xs">
            ক্যাশ অন ডেলিভারি
          </span>
          <span className="px-2 py-0.5 bg-[#E2136E] text-white font-bold text-[10px] rounded-md shadow-xs">
            bKash
          </span>
          <span className="px-2 py-0.5 bg-[#F7941D] text-white font-bold text-[10px] rounded-md shadow-xs">
            Nagad
          </span>
          <span className="px-2 py-0.5 bg-[#8C3494] text-white font-bold text-[10px] rounded-md shadow-xs">
            Rocket
          </span>
        </div>
      </div>

      {/* Floating WhatsApp Quick Action Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20Preyoshi%20Shop%20Support`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 group"
        title="Chat with Preyoshi Shop on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          WhatsApp এ চ্যাট করুন
        </span>
      </a>
    </footer>
  );
};
