import React, { useState } from 'react';
import {
  X, User, Phone, MapPin, Package, LogOut, Printer, Edit2, Check,
  Clock, Award, Sparkles, Bell, Trash2, ExternalLink, TrendingDown,
  CheckCircle2, ShieldCheck, Link as LinkIcon, Plus, Mail, Smartphone
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { OrderHistory } from './OrderHistory';
import { LoyaltySection } from './LoyaltySection';

export const CustomerProfileModal: React.FC = () => {
  const {
    isProfileOpen,
    setIsProfileOpen,
    orders,
    priceDropAlerts,
    removePriceDropAlert,
    setSelectedProductId,
    setCurrentView,
    products,
    claimGuestOrder
  } = useStore();
  const {
    currentUser,
    logout,
    updateProfile,
    isAdmin,
    confirmEmailVerification,
    sendPhoneOtp,
    verifyPhoneOtp
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'loyalty' | 'alerts' | 'profile'>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [claimOrderInput, setClaimOrderInput] = useState('');
  const [claimStatusMsg, setClaimStatusMsg] = useState<{ success: boolean; text: string } | null>(null);

  if (!isProfileOpen || !currentUser) return null;

  // Filter orders count for badge
  const cleanPhone = currentUser.phone ? currentUser.phone.replace(/[^0-9]/g, '') : '';
  const userOrderCount = orders.filter(o => {
    const matchUserId = o.userId && o.userId === currentUser.id;
    const cleanOrderPhone = o.phone ? o.phone.replace(/[^0-9]/g, '') : '';
    const matchPhone = cleanPhone && cleanOrderPhone && (
      cleanOrderPhone.endsWith(cleanPhone.slice(-8)) || cleanPhone.endsWith(cleanOrderPhone.slice(-8))
    );
    return matchUserId || matchPhone;
  }).length;

  // Filter user price drop alerts
  const userAlerts = priceDropAlerts.filter(a => a.userId === currentUser.id && a.status === 'active');


  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim()
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#FFF9F2] rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#7A1238]/20 my-6 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#7A1238] text-[#F6E2B3] flex items-center justify-center font-bold text-lg shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold font-bangla text-base sm:text-lg text-[#2A101A]">
                  {currentUser.name}
                </h3>
                <span className="text-[10px] bg-[#D9A441]/20 text-[#7A1238] font-bold px-2 py-0.5 rounded-full border border-[#D9A441]/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D9A441]" />
                  <span>{currentUser.loyaltyPoints ?? 0} pts</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium font-bangla">
                {currentUser.role === 'admin' ? 'Preyoshi Administrator' : 'সম্মানিত কাস্টমার'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                logout();
                setIsProfileOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
            <button
              onClick={() => setIsProfileOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 py-3 border-b border-gray-200 shrink-0 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#7A1238] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4 text-[#D9A441]" />
            <span className="font-bangla">অর্ডার হিস্টোরি</span>
            <span className="bg-[#BE0750] text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {userOrderCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'loyalty'
                ? 'bg-[#7A1238] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Award className="w-4 h-4 text-[#D9A441]" />
            <span className="font-bangla">লয়্যালটি ও রিওয়ার্ডস</span>
            <span className="bg-[#D9A441] text-stone-900 font-extrabold px-1.5 py-0.2 rounded-full text-[10px]">
              {currentUser.loyaltyPoints ?? 0} pts
            </span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#7A1238] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell className="w-4 h-4 text-[#D9A441]" />
            <span className="font-bangla">প্রাইস ড্রপ অ্যালার্ট</span>
            {userAlerts.length > 0 && (
              <span className="bg-[#BE0750] text-white px-1.5 py-0.2 rounded-full text-[10px]">
                {userAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 sm:px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#7A1238] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="font-bangla">প্রোফাইল ও ঠিকানা</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === 'orders' && (
            <OrderHistory userPhone={currentUser.phone} userId={currentUser.id} />
          )}

          {activeTab === 'loyalty' && (
            <LoyaltySection />
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4 py-1">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-sm text-[#7A1238] font-bangla">
                    আপনার সংরক্ষিত মূল্য হ্রাস অ্যালার্টসমূহ
                  </h4>
                  <p className="text-xs text-gray-500 font-bangla">
                    পণ্যগুলোর দাম আপনার কাঙ্ক্ষিত মূল্যে পৌঁছালে সাথে সাথে ইমেইল ও এসএমএস নোটিফিকেশন পাবেন।
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-400 font-bold bg-white px-2.5 py-1 rounded-lg border">
                  {userAlerts.length} Active
                </span>
              </div>

              {userAlerts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {userAlerts.map(alert => {
                    const liveProd = products.find(p => p.id === alert.productId);
                    const currentLivePrice = liveProd ? (liveProd.discountPrice ?? liveProd.regularPrice) : alert.currentPriceAtSet;
                    const isTargetMet = currentLivePrice <= alert.targetPrice;

                    return (
                      <div
                        key={alert.id}
                        className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs hover:border-[#D9A441] transition-all flex flex-col justify-between gap-3 relative group"
                      >
                        {isTargetMet && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold animate-pulse font-bangla">
                            🎉 টার্গেট মূল্য অর্জিত!
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <img
                            src={alert.productImage}
                            alt={alert.productNameEn}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs sm:text-sm font-bold text-gray-900 font-bangla truncate">
                              {alert.productNameBn}
                            </h5>
                            <p className="text-[11px] text-gray-500 truncate">{alert.productNameEn}</p>

                            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 text-xs">
                              <div>
                                <span className="text-[10px] text-gray-400 font-bangla block">বর্তমান মূল্য:</span>
                                <strong className="font-black text-gray-800 font-mono">
                                  ৳{currentLivePrice.toLocaleString()}
                                </strong>
                              </div>
                              <div>
                                <span className="text-[10px] text-[#7A1238] font-bangla font-semibold block">কাঙ্ক্ষিত টার্গেট:</span>
                                <strong className="font-black text-[#7A1238] font-mono text-sm">
                                  ৳{alert.targetPrice.toLocaleString()}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                          <button
                            onClick={() => {
                              setSelectedProductId(alert.productId);
                              setCurrentView('product_detail');
                              setIsProfileOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[#7A1238] hover:text-[#BE0750] font-bold text-xs font-bangla cursor-pointer group-hover:underline"
                          >
                            <span>পণ্য দেখুন</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('আপনি কি এই অ্যালার্টটি মুছে ফেলতে চান?')) {
                                removePriceDropAlert(alert.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer p-1"
                            title="অ্যালার্ট মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="font-bangla">বাতিল</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 bg-white rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
                  <Bell className="w-10 h-10 text-gray-300 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-800 font-bangla">
                    কোনো সক্রিয় প্রাইস ড্রপ অ্যালার্ট নেই
                  </h4>
                  <p className="text-xs text-gray-500 font-bangla max-w-sm mx-auto">
                    যেকোনো পণ্যের বিবরণ পেজে গিয়ে "দাম কমলে নোটিফিকেশন দিন" বাটনে ক্লিক করে টার্গেট মূল্য সেট করুন।
                  </p>
                </div>
              )}
            </div>
          )}


          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-xl mx-auto py-2">
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-3.5 bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs">
                  <h4 className="font-bold text-sm text-gray-900 font-bangla border-b pb-2">
                    ব্যক্তিগত তথ্য সংশোধন করুন
                  </h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">আপনার নাম:</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:border-[#BE0750]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">মোবাইল নম্বর:</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:border-[#BE0750]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">ডেলিভারি ঠিকানা:</label>
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={e => setEditAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl focus:border-[#BE0750]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>সংরক্ষণ করুন</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Account Summary Card */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-gray-900 font-bangla">
                            একাউন্টের বিবরণ ও ভেরিফিকেশন
                          </h4>
                          {(currentUser.isEmailVerified || currentUser.isPhoneVerified) ? (
                            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>যাচাইকৃত গ্রাহক (Verified Account)</span>
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                              আন-ভেরিফাইড
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditName(currentUser.name);
                          setEditPhone(currentUser.phone);
                          setEditAddress(currentUser.address || '');
                          setIsEditing(true);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-[#F8E8E9] hover:text-[#7A1238] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>সম্পাদনা</span>
                      </button>
                    </div>

                    <div className="space-y-3 text-xs text-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-[#7A1238]" />
                          <span>নাম: <strong className="text-gray-900 text-sm ml-1">{currentUser.name}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-[#7A1238]" />
                          <span>মোবাইল: <strong className="text-gray-900 font-mono ml-1">{currentUser.phone}</strong></span>
                        </div>
                        {currentUser.isPhoneVerified ? (
                          <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ফোন ভেরিফাইড</span>
                          </span>
                        ) : (
                          <button
                            onClick={async () => {
                              const res = await sendPhoneOtp(currentUser.phone);
                              alert(`ডেমো ওটিপি কোড: ${res.simulatedCode}`);
                              await verifyPhoneOtp(res.simulatedCode);
                            }}
                            className="text-[10px] text-[#BE0750] font-bold hover:underline cursor-pointer"
                          >
                            ওটিপি দিয়ে ভেরিফাই করুন
                          </button>
                        )}
                      </div>

                      {currentUser.email && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-[#7A1238]" />
                            <span>ইমেইল: <span className="text-gray-800 ml-1">{currentUser.email}</span></span>
                          </div>
                          {currentUser.isEmailVerified ? (
                            <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>ইমেইল ভেরিফাইড</span>
                            </span>
                          ) : (
                            <button
                              onClick={async () => {
                                await confirmEmailVerification();
                              }}
                              className="text-[10px] text-[#BE0750] font-bold hover:underline cursor-pointer"
                            >
                              ইমেইল ভেরিফাই করুন
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-[#7A1238] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          ঠিকানা: <span className="text-gray-800 ml-1">{currentUser.address || 'কোনো ঠিকানা সংরক্ষিত নেই'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Past Guest Order Tool (Module 5) */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-[#7A1238]" />
                      <h4 className="font-bold text-xs text-gray-900 font-bangla">
                        পূর্বের গেস্ট অর্ডার একাউন্টে লিঙ্ক করুন (Claim Guest Order)
                      </h4>
                    </div>
                    <p className="text-[11px] text-gray-500 font-bangla">
                      অ্যাকাউন্ট খোলার পূর্বে কোনো অর্ডার দিয়ে থাকলে আপনার অর্ডার নম্বর বা ফোন নম্বর দিয়ে এখানে যুক্ত করে নিন।
                    </p>

                    {claimStatusMsg && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-bangla ${
                          claimStatusMsg.success
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {claimStatusMsg.text}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={claimOrderInput}
                        onChange={e => setClaimOrderInput(e.target.value)}
                        placeholder="যেমন: PRY-2026-0813"
                        className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl focus:border-[#BE0750] outline-hidden uppercase font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!claimOrderInput.trim()) return;
                          const res = claimGuestOrder(claimOrderInput.trim(), currentUser.phone, currentUser.id);
                          setClaimStatusMsg({ success: res.success, text: res.message });
                          if (res.success) setClaimOrderInput('');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        অর্ডার লিঙ্ক করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
