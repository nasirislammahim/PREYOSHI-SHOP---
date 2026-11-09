import React, { useState } from 'react';
import {
  X, Lock, Phone, User as UserIcon, ShieldCheck, ArrowRight,
  KeyRound, CheckCircle2, AlertCircle, RefreshCw, Smartphone, Mail
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../brand/BrandLogo';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen } = useStore();
  const {
    login,
    loginAsAdmin,
    loginWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    requestPasswordReset
  } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp' | 'forgot_password'>('login');
  const [name, setName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthOpen) return null;

  const showMsg = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) return;

    login(phoneOrEmail.trim(), authMode === 'register' ? name.trim() : undefined);
    setIsAuthOpen(false);
  };

  const handleTriggerOtp = async () => {
    const cleanPhone = phoneOrEmail.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11 || !cleanPhone.startsWith('01')) {
      showMsg('error', 'ওটিপি পাঠাতে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।');
      return;
    }
    setLoading(true);
    const res = await sendPhoneOtp(cleanPhone);
    setLoading(false);
    if (res.success) {
      setSimulatedCode(res.simulatedCode);
      setAuthMode('otp');
      showMsg('success', `আপনার ফোনে ৬ সংখ্যার ওটিপি পাঠানো হয়েছে। ডেমো ওটিপি: ${res.simulatedCode}`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setLoading(true);
    const res = await verifyPhoneOtp(otpCode);
    setLoading(false);

    if (res.success) {
      login(phoneOrEmail.trim(), name.trim() || 'Verified Customer');
      setIsAuthOpen(false);
    } else {
      showMsg('error', res.message);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) {
      showMsg('error', 'মোবাইল নম্বর বা ইমেইল লিখুন।');
      return;
    }
    setLoading(true);
    const res = await requestPasswordReset(phoneOrEmail.trim());
    setLoading(false);
    showMsg('success', res.message);
    setTimeout(() => setAuthMode('login'), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FFF9F2] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#7A1238]/20 text-center space-y-4">
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-1">
          <BrandLogo size="md" />
        </div>

        {/* Modal Title */}
        <div>
          <h3 className="text-xl font-bold font-bangla text-[#2A101A]">
            {authMode === 'register'
              ? 'নতুন কাস্টমার একাউন্ট রেজিস্ট্রেশন'
              : authMode === 'otp'
              ? 'মোবাইল ওটিপি ভেরিফিকেশন'
              : authMode === 'forgot_password'
              ? 'পাসওয়ার্ড রিকভারি ও রিসেট'
              : 'আপনার একাউন্টে লগইন করুন'}
          </h3>
          <p className="text-xs text-gray-500 font-bangla mt-1">
            {authMode === 'otp'
              ? 'আপনার মোবাইলে প্রেরিত ৬ সংখ্যার কোড লিখুন'
              : 'অর্ডার হিস্টোরি, পয়েন্ট ও দ্রুত চেকআউট সুবিধা উপভোগ করুন'}
          </p>
        </div>

        {notification && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 text-left animate-fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
        )}

        {/* 1. OTP Mode */}
        {authMode === 'otp' ? (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5 text-left text-xs">
            {simulatedCode && (
              <div
                onClick={() => setOtpCode(simulatedCode)}
                className="p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors text-amber-900"
              >
                <div className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                  🔐 ডেমো ভেরিফিকেশন ওটিপি (ক্লিক করে পেস্ট করুন):
                </div>
                <div className="text-lg font-mono font-bold tracking-widest mt-0.5">{simulatedCode}</div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-1 font-bangla">
                ৬ সংখ্যার ওটিপি কোড লিখুন *
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-lg font-mono px-3 py-2 border border-gray-300 rounded-xl focus:border-[#BE0750] outline-hidden bg-white"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs font-bangla transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'যাচাই হচ্ছে...' : 'ওটিপি নিশ্চিত করে লগইন করুন'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-gray-500 hover:text-gray-800 text-xs font-semibold"
              >
                ← লগইন অপশনে ফিরে যান
              </button>
            </div>
          </form>
        ) : authMode === 'forgot_password' ? (
          /* 2. Forgot Password Mode */
          <form onSubmit={handlePasswordReset} className="space-y-3.5 text-left text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1 font-bangla">
                রেজিস্টার্ড মোবাইল বা ইমেইল ঠিকানা *
              </label>
              <input
                type="text"
                required
                value={phoneOrEmail}
                onChange={e => setPhoneOrEmail(e.target.value)}
                placeholder="017XXXXXXXX অথবা user@email.com"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#BE0750] outline-hidden bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs font-bangla transition-colors shadow-md cursor-pointer"
            >
              <span>{loading ? 'প্রেরণ হচ্ছে...' : 'পাসওয়ার্ড রিসেট নির্দেশাবলী পাঠান'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-gray-500 hover:text-gray-800 text-xs font-semibold"
              >
                ← লগইনে ফিরে যান
              </button>
            </div>
          </form>
        ) : (
          /* 3. Standard Login / Register */
          <form onSubmit={handleStandardSubmit} className="space-y-3 text-left text-xs">
            {authMode === 'register' && (
              <div>
                <label className="block text-gray-700 font-semibold mb-1 font-bangla">
                  আপনার পূর্ণ নাম:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="যেমন: তানজিলা আহমেদ"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#BE0750] outline-hidden bg-white"
                  />
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-gray-700 font-semibold font-bangla">
                  মোবাইল নম্বর অথবা ইমেইল:
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot_password')}
                    className="text-[11px] text-[#BE0750] hover:underline"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={e => setPhoneOrEmail(e.target.value)}
                  placeholder="017XXXXXXXX অথবা user@email.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#BE0750] outline-hidden bg-white"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs font-bangla transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{authMode === 'register' ? 'রেজিস্ট্রেশন করুন' : 'লগইন করুন'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleTriggerOtp}
                className="px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs font-bangla transition-colors cursor-pointer flex items-center gap-1"
                title="মোবাইলে ওটিপি কোড দিয়ে লগইন"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>OTP লগইন</span>
              </button>
            </div>
          </form>
        )}

        {/* Google Authentication Divider */}
        {authMode !== 'otp' && authMode !== 'forgot_password' && (
          <>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#FFF9F2] px-2 text-gray-500 font-bangla text-[11px]">অথবা</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                await loginWithGoogle();
                setIsAuthOpen(false);
              }}
              className="w-full py-2.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold text-xs font-bangla transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google দিয়ে সাইন-ইন করুন</span>
            </button>

            <div className="pt-2 text-xs text-gray-600 font-bangla">
              {authMode === 'register' ? (
                <span>
                  পূর্বেই একাউন্ট আছে?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-[#BE0750] font-bold hover:underline"
                  >
                    লগইন করুন
                  </button>
                </span>
              ) : (
                <span>
                  নতুন ক্রেতা?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-[#BE0750] font-bold hover:underline"
                  >
                    একাউন্ট তৈরি করুন
                  </button>
                </span>
              )}
            </div>
          </>
        )}

        {/* Demo Fast Super Admin Session */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold font-serif-brand">
            নিরাপদ একক সুপার অ্যাডমিন বুটস্ট্র্যাপ
          </p>
          <button
            onClick={() => {
              loginAsAdmin();
              setIsAuthOpen(false);
            }}
            className="w-full mt-1 py-1.5 px-3 bg-[#7A1238]/10 hover:bg-[#7A1238]/20 text-[#7A1238] rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#BE0750]" />
            <span>সুপার অ্যাডমিন টার্মিনাল ({'nasirislammahimbd@gmail.com'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
