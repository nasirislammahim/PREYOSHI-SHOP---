import React from 'react';
import { Star, CheckCircle, Quote, MessageSquare } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CustomerReviews: React.FC = () => {
  const { reviews } = useStore();

  return (
    <section className="py-12 bg-white border-y border-[#7A1238]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8E8E9] text-[#7A1238] text-xs font-bold uppercase tracking-wider mb-2 font-serif-brand">
            <MessageSquare className="w-3.5 h-3.5 text-[#BE0750]" />
            <span>সন্তুষ্ট গ্রাহকদের প্রতিক্রিয়া</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-bangla text-[#2A101A]">
            গ্রাহক রিভিউ ও অভিজ্ঞতা
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-bangla mt-2">
            সারাদেশের শত শত সন্তুষ্ট ক্রেতা প্রেয়সী শপের কোয়ালিটি ও সার্ভিসের উপর আস্থা রেখেছেন
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {reviews.slice(0, 4).map(rev => (
            <div
              key={rev.id}
              className="bg-[#FFF9F2] p-5 rounded-2xl border border-[#7A1238]/10 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-[#D9A441] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-current text-[#D9A441]' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-1.5">{rev.rating}.0</span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-gray-700 font-bangla leading-relaxed italic line-clamp-4">
                  "{rev.comment}"
                </p>
              </div>

              {/* Category & Verified Badge */}
              {rev.category && (
                <div className="mt-2.5">
                  <span className="text-[10px] bg-white border border-[#D9A441]/30 text-[#7A1238] font-bold px-2 py-0.5 rounded">
                    {rev.category === 'saree_fabric'
                      ? '🥻 শাড়ি ও ফেব্রিক'
                      : rev.category === 'overseas_gift'
                      ? '✈️ প্রবাসী উপহার'
                      : rev.category === 'bangladesh_delivery'
                      ? '🇧🇩 হোম ডেলিভারি'
                      : rev.category === 'jewellery_craft'
                      ? '💎 জুয়েলারি'
                      : rev.category === 'packaging_safety'
                      ? '📦 প্রিমিয়াম প্যাকেজিং'
                      : 'সাধারণ'}
                  </span>
                </div>
              )}

              {/* Author & Location */}
              <div className="pt-3.5 mt-3 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{rev.customerName}</h4>
                  {rev.location && (
                    <p className="text-[10px] text-gray-500 font-bangla">{rev.location}</p>
                  )}
                </div>
                {rev.verifiedPurchase && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    <span>যাচাইকৃত ক্রেতা</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
