import React from 'react';
import { X, Phone, Mail, MapPin, MessageCircle, ExternalLink, ShieldCheck, HelpCircle, FileText } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../brand/BrandLogo';

export const SupportModals: React.FC = () => {
  const { activePolicyModal, setActivePolicyModal, settings } = useStore();

  if (!activePolicyModal) return null;

  const handleClose = () => setActivePolicyModal(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFF9F2] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#7A1238]/20 my-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Contact Us */}
        {activePolicyModal === 'contact' && (
          <div className="space-y-5 animate-fade-in text-gray-800">
            <div className="text-center pb-4 border-b border-gray-200">
              <div className="flex justify-center mb-2">
                <BrandLogo size="md" />
              </div>
              <h3 className="text-xl font-bold font-bangla text-[#2A101A]">আমাদের সাথে যোগাযোগ করুন</h3>
              <p className="text-xs text-gray-500 font-bangla mt-1">
                যেকোনো তথ্য, অর্ডার সহায়তা বা ব্যবসায়িক অনুসন্ধানে আমরা আপনার সেবায় নিয়োজিত
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-[#7A1238] font-bold">
                  <Phone className="w-4 h-4" />
                  <span>কাস্টমার সাপোর্ট হটলাইন</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{settings.supportPhone}</p>
                <p className="text-[11px] text-gray-500 font-bangla">প্রতিদিন সকাল ৯টা থেকে রাত ১১টা</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-[#25D366] font-bold">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp সরাসরি চ্যাট</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{settings.whatsappNumber}</p>
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#25D366] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>হোয়াটসঅ্যাপে মেসেজ পাঠান</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-[#1877F2] font-bold">
                  <span className="font-bold">f</span>
                  <span>অফিসিয়াল ফেসবুক পেজ</span>
                </div>
                <p className="text-xs text-gray-700">facebook.com/Preyoshishop</p>
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#1877F2] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>পেজে ভিজিট করুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-[#7A1238] font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>হেড অফিস ও শোরুম</span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-bangla">
                  {settings.supportAddress}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8E8E9]/50 border border-[#7A1238]/20 text-xs text-center font-bangla">
              <span>Brand Identity & Design Architecture by: </span>
              <strong className="text-[#7A1238]">{settings.designerCredit}</strong>
            </div>
          </div>
        )}

        {/* 2. FAQ */}
        {activePolicyModal === 'faq' && (
          <div className="space-y-4 animate-fade-in text-gray-800">
            <div className="pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold font-bangla text-[#2A101A] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#BE0750]" />
                <span>সাধারণ জিজ্ঞাসা (FAQ)</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed font-bangla">
              <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1">প্রশ্ন ১: প্রেয়সী শপে কি ক্যাশ অন ডেলিভারি সুবিধা আছে?</h4>
                <p className="text-gray-600">
                  হ্যাঁ, সারা বাংলাদেশে আমাদের ক্যাশ অন ডেলিভারি সুবিধা চালু রয়েছে। পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করতে পারবেন।
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1">প্রশ্ন ২: ঢাকা ও ঢাকার বাইরে ডেলিভারি পেতে কত সময় লাগে?</h4>
                <p className="text-gray-600">
                  ঢাকা সিটির মধ্যে ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৪৮ থেকে ৭২ ঘণ্টার মধ্যে কুরিয়ার সার্ভিসের মাধ্যমে ডেলিভারি সম্পন্ন হয়।
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1">প্রশ্ন ৩: শাড়ি বা পোশাকের সাইজ বা রঙে সমস্যা হলে কি বদলানো যাবে?</h4>
                <p className="text-gray-600">
                  নিশ্চয়ই! আমাদের ৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি রয়েছে। ডেলিভারি গ্রহণের ৭ দিনের মধ্যে কাস্টমার কেয়ারে জানালেই সমাধান পাবেন।
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1">প্রশ্ন ৪: অর্ডার ট্র্যাক করব কীভাবে?</h4>
                <p className="text-gray-600">
                  ওয়েবসাইটের উপরে থাকা "অর্ডার ট্র্যাক" বাটনে ক্লিক করে আপনার প্রাপ্ত অর্ডার নম্বর লিখলেই পার্সেলের বর্তমান স্ট্যাটাস দেখতে পারবেন।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Return & Refund Policy */}
        {activePolicyModal === 'return_policy' && (
          <div className="space-y-4 animate-fade-in text-gray-800 font-bangla text-xs leading-relaxed">
            <div className="pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#2A101A]">রিটার্ন ও রিফান্ড পলিসি (Return & Refund)</h3>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200">
              <p>১. <strong>৭ দিনের রিটার্ন গ্যারান্টি:</strong> পণ্য ডেলিভারি পাওয়ার ৭ দিনের মধ্যে যেকোনো ত্রুটি বা সাইজ পরিবর্তনের জন্য রিটার্ন রিকোয়েস্ট করতে পারেন।</p>
              <p>২. <strong>রিটার্ন গ্রহণের শর্ত:</strong> পণ্যটি অব্যবহৃত, মূল ট্যাগ ও প্যাকেজিংসহ অক্ষত থাকতে হবে।</p>
              <p>৩. <strong>রিফান্ড প্রক্রিয়া:</strong> পণ্য আমাদের সেন্ট্রাল হাবে পৌঁছানোর পর কোয়ালিটি যাচাই সাপেক্ষে ২৪ থেকে ৭২ ঘণ্টার মধ্যে আপনার বিকাশ/নগদ বা ব্যাংক অ্যাকাউন্টে রিফান্ড ট্রান্সফার করা হবে।</p>
              <p>৪. ডেলিভারি ম্যানের সামনে পণ্য চেক করার জন্য বিশেষ অনুরোধ করা হচ্ছে।</p>
            </div>
          </div>
        )}

        {/* 4. Privacy Policy */}
        {activePolicyModal === 'privacy' && (
          <div className="space-y-4 animate-fade-in text-gray-800 font-bangla text-xs leading-relaxed">
            <div className="pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#2A101A]">গোপনীয়তা নীতি (Privacy Policy)</h3>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200">
              <p>১. প্রেয়সী শপ গ্রাহকের নাম, মোবাইল নম্বর এবং ডেলিভারি ঠিকানার সর্বোচ্চ নিরাপত্তা প্রদান করে।</p>
              <p>২. সংগৃহীত তথ্য শুধুমাত্র অর্ডার ডেলিভারি, পার্সেল ট্র্যাকিং এবং কাস্টমার সার্ভিসের জন্য ব্যবহার করা হয়।</p>
              <p>৩. আমরা কোনো তৃতীয় পক্ষের কাছে গ্রাহকের ব্যক্তিগত তথ্য বিক্রি বা হস্তান্তর করি না।</p>
            </div>
          </div>
        )}

        {/* 5. Terms & Conditions */}
        {activePolicyModal === 'terms' && (
          <div className="space-y-4 animate-fade-in text-gray-800 font-bangla text-xs leading-relaxed">
            <div className="pb-3 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#2A101A]">শর্তাবলী (Terms & Conditions)</h3>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200">
              <p>১. প্রেয়সী শপের সকল পণ্যের মূল্য বাংলাদেশি টাকা (BDT ৳) তে নির্ধারিত।</p>
              <p>২. অফার ও ডিসকাউন্ট কুপন কর্তৃপক্ষের পূর্ব নোটিশ ছাড়াই পরিবর্তনযোগ্য হতে পারে।</p>
              <p>৩. অপ্রত্যাশিত প্রাকৃতিক দুর্যোগ বা কুরিয়ারজনিত বিলম্ব ব্যতীত নির্ধারিত সময়ের মধ্যে পণ্য পৌঁছাতে আমরা প্রতিশ্রুতিবদ্ধ।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
