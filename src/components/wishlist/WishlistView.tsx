import React, { useState } from 'react';
import {
  Heart, ShoppingBag, ArrowLeft, Trash2, Share2, Check,
  Sparkles, Eye, CheckCircle2, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const WishlistView: React.FC = () => {
  const {
    wishlist,
    products,
    removeFromCart,
    toggleWishlist,
    clearWishlist,
    moveWishlistToCart,
    moveAllWishlistToCart,
    addToCart,
    setSelectedProductId,
    setCurrentView,
    setQuickViewProduct,
    addToCompare,
    isInCompare,
    setIsCompareModalOpen
  } = useStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filter wishlisted products
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleMoveToCart = (product: Product) => {
    const success = moveWishlistToCart(product.id);
    if (success) {
      setFeedbackMsg(`"${product.nameBn}" কার্ট-এ যোগ করা হয়েছে!`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleMoveAll = () => {
    moveAllWishlistToCart();
    setFeedbackMsg('পছন্দের সকল পণ্য কার্ট-এ সফলভাবে যোগ করা হয়েছে!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCompareToggle = (productId: string) => {
    const res = addToCompare(productId);
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      {/* 1. Breadcrumb and Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#7A1238]/10 mb-8">
        <div>
          <button
            onClick={() => setCurrentView('store')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7A1238] hover:text-[#BE0750] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bangla">স্টোরে ফিরে যান</span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#BE0750]/15 flex items-center justify-center text-[#BE0750]">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-bangla text-[#2A101A]">
                আপনার পছন্দের তালিকা (Wishlist)
              </h1>
              <p className="text-xs text-gray-500 font-bangla">
                আপনার পছন্দের পণ্যগুলো সংরক্ষিত রয়েছে ({wishlistedProducts.length} টি আইটেম)
              </p>
            </div>
          </div>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-[#7A1238] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Share Wishlist Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'লিঙ্ক কপি হয়েছে!' : 'শেয়ার করুন'}</span>
            </button>

            <button
              onClick={handleMoveAll}
              className="px-4 py-2 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#F6E2B3]" />
              <span className="font-bangla">সব কার্ট-এ নিন</span>
            </button>

            <button
              onClick={() => {
                if (confirm('আপনি কি পছন্দের তালিকা খালি করতে চান?')) {
                  clearWishlist();
                }
              }}
              className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
              title="Clear entire wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Floating feedback alert */}
      {feedbackMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bangla flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* 2. Wishlist Grid or Empty State */}
      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-10 sm:p-16 text-center max-w-2xl mx-auto space-y-4 my-8">
          <div className="w-20 h-20 rounded-full bg-[#F8E8E9] flex items-center justify-center mx-auto text-[#BE0750] shadow-inner">
            <Heart className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold font-bangla text-gray-900">
            আপনার পছন্দের তালিকা বর্তমানে খালি
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-bangla max-w-md mx-auto leading-relaxed">
            পণ্য ব্রাউজ করার সময় হার্ট (♥) আইকনে ক্লিক করে আপনার প্রিয় শাড়ি, গয়না বা ড্রেস সংরক্ষণ করুন যাতে পরবর্তীতে সহজেই খুঁজে পান!
          </p>
          <button
            onClick={() => setCurrentView('store')}
            className="mt-4 px-6 py-3 rounded-2xl bg-[#7A1238] hover:bg-[#BE0750] text-white font-bold text-xs sm:text-sm font-bangla transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            কালেকশন দেখতে যান
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map(product => {
            const currentPrice = product.discountPrice ?? product.regularPrice;
            const discountPercent = product.discountPrice
              ? Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100)
              : 0;
            const inCompare = isInCompare(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Image Section */}
                <div
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setCurrentView('product_detail');
                  }}
                  className="relative aspect-4/5 overflow-hidden bg-[#F8E8E9]/30 cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    {discountPercent > 0 && (
                      <span className="bg-[#BE0750] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        -{discountPercent}%
                      </span>
                    )}
                    {product.isNewArrival && (
                      <span className="bg-[#7A1238] text-[#F6E2B3] text-[9px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                        নতুন
                      </span>
                    )}
                  </div>

                  {/* Remove from wishlist button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Quick View */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct(product);
                    }}
                    className="absolute bottom-2.5 right-2.5 hidden sm:flex items-center gap-1.5 bg-white/90 hover:bg-white text-[#7A1238] text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#BE0750]" />
                    <span>কুইক ভিউ</span>
                  </button>
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[#D9A441] tracking-wider font-serif-brand">
                      {product.categoryId}
                    </span>
                    <h3
                      onClick={() => {
                        setSelectedProductId(product.id);
                        setCurrentView('product_detail');
                      }}
                      className="text-xs sm:text-sm font-bold font-bangla text-gray-900 group-hover:text-[#BE0750] transition-colors line-clamp-1 cursor-pointer mt-0.5"
                    >
                      {product.nameBn}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-1 font-serif-brand">
                      {product.nameEn}
                    </p>

                    {/* Stock Status */}
                    <div className="mt-2 flex items-center gap-2">
                      {product.stock > 0 ? (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                          ইন স্টক ({product.stock} টি আছে)
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-md">
                          স্টক শেষ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-2 border-t border-gray-100 space-y-2.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-[#7A1238]">
                        ৳{currentPrice.toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ৳{product.regularPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Move to Cart */}
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={product.stock <= 0}
                        className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          product.stock <= 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#7A1238] hover:bg-[#BE0750] text-white shadow-xs'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="truncate font-bangla">কার্ট-এ নিন</span>
                      </button>

                      {/* Compare Button */}
                      <button
                        onClick={() => handleCompareToggle(product.id)}
                        className={`py-2 px-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 border transition-colors cursor-pointer ${
                          inCompare
                            ? 'bg-[#BE0750]/10 border-[#BE0750] text-[#BE0750]'
                            : 'bg-white border-gray-200 hover:border-[#7A1238] text-gray-700'
                        }`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span className="truncate">{inCompare ? 'যোগ করা হয়েছে' : 'তুলনা করুন'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
