import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Star, Heart, ShoppingBag, Truck, ShieldCheck,
  RotateCcw, Check, Share2, Sparkles, MessageSquare, Send, SlidersHorizontal, Ruler, Camera, Bell,
  ThumbsUp, CheckCircle2, Lightbulb, FileText, CornerDownRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from './ProductCard';
import { SizeGuideModal } from './SizeGuideModal';
import { PriceDropModal } from './PriceDropModal';
import { SAMPLE_REVIEW_TEMPLATES } from '../../data/initialData';
import { ReviewCategory, ReviewTemplate } from '../../types';

export const ProductDetailView: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    setCurrentView,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addToCompare,
    removeFromCompare,
    isInCompare,
    setIsCartOpen,
    setIsAuthOpen,
    recordProductView,
    getProductReviews,
    addReview,
    toggleHelpfulReview,
    verifyCustomerPurchaseForProduct,
    openARTryOn,
    getUserPriceAlertForProduct
  } = useStore();

  const { currentUser } = useAuth();


  const product = products.find(p => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (product) {
      recordProductView(product.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product, recordProductView]);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isPriceDropModalOpen, setIsPriceDropModalOpen] = useState(false);

  // Review form state
  const [reviewName, setReviewName] = useState(currentUser?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewCategory, setReviewCategory] = useState<ReviewCategory>('saree_fabric');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLocation, setReviewLocation] = useState(currentUser?.district || 'Dhaka');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  if (!product) return null;

  // Real purchase verification against delivered orders (Module 7 & 8)
  const deliveredPurchaseCheck = verifyCustomerPurchaseForProduct(
    product.id,
    currentUser?.id,
    currentUser?.phone
  );

  const activePriceAlert = currentUser ? getUserPriceAlertForProduct(product.id, currentUser.id) : undefined;
  const isWished = isInWishlist(product.id);
  const currentPrice = product.discountPrice ?? product.regularPrice;

  const discountPercent = product.discountPrice
    ? Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100)
    : 0;

  const activeSize = selectedSize || (product.sizes[0] ?? '');
  const activeColor = selectedColor || (product.colors[0] ?? '');

  const productReviews = getProductReviews(product.id);
  const relatedProducts = products
    .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity, activeSize, activeColor);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, activeSize, activeColor);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSelectTemplate = (template: ReviewTemplate) => {
    setReviewComment(template.sampleTextBn);
    setReviewCategory(template.category);
    setReviewRating(template.rating);
    setIsTemplatesModalOpen(false);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    addReview({
      productId: product.id,
      customerName: reviewName.trim(),
      userId: currentUser?.id,
      rating: reviewRating,
      comment: reviewComment.trim(),
      location: reviewLocation.trim() || 'Bangladesh',
      category: reviewCategory,
      verifiedPurchase: deliveredPurchaseCheck.isVerified,
      orderId: deliveredPurchaseCheck.orderId,
      status: 'approved',
      helpfulCount: 0,
      votedUserIds: []
    });

    setReviewSubmitted(true);
    setReviewComment('');
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fade-in">
      {/* 1. Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentView('store')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#7A1238] hover:text-[#BE0750] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-bangla">স্টোরে ফিরে যান</span>
        </button>

        <div className="flex items-center gap-2">
          {product.isDemo && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-sm">
              DEMO DATA
            </span>
          )}
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-[#F8E8E9] hover:text-[#7A1238] transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copiedLink ? 'কপি হয়েছে!' : 'শেয়ার করুন'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-4/5 rounded-3xl overflow-hidden bg-white shadow-md border border-[#7A1238]/10">
            <img
              src={product.images[activeImgIndex] || product.images[0]}
              alt={product.nameEn}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-[#BE0750] text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                -{discountPercent}% ছাড়
              </span>
            )}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full shadow-md transition-colors ${
                  isWished ? 'bg-[#BE0750] text-white' : 'bg-white/90 text-gray-700 hover:text-[#BE0750]'
                }`}
                title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => {
                  if (isInCompare(product.id)) {
                    removeFromCompare(product.id);
                  } else {
                    addToCompare(product.id);
                  }
                }}
                className={`p-2.5 rounded-full shadow-md transition-colors ${
                  isInCompare(product.id) ? 'bg-[#7A1238] text-[#F6E2B3]' : 'bg-white/90 text-gray-700 hover:text-[#7A1238]'
                }`}
                title={isInCompare(product.id) ? 'Remove from Compare' : 'Compare Product'}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImgIndex === idx
                      ? 'border-[#BE0750] shadow-md scale-102 ring-2 ring-[#BE0750]/20'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Form */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Rating & SKU */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-[#D9A441]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-gray-900 ml-1">{product.rating}</span>
                </div>
                <span>·</span>
                <span className="font-bangla">({product.reviewCount} টি কাস্টমার রিভিউ)</span>
              </div>
              <span className="font-mono text-gray-400">SKU: {product.sku}</span>
            </div>

            {/* Titles */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-bangla text-[#2A101A] leading-tight">
                {product.nameBn}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-serif-brand mt-1 font-medium">
                {product.nameEn}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F8E8E9]/60 to-[#FFF9F2] border border-[#7A1238]/10 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-[#7A1238]">
                ৳{currentPrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-base text-gray-400 line-through">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-[#BE0750] bg-[#BE0750]/10 px-2 py-0.5 rounded-md">
                  ৳{(product.regularPrice - product.discountPrice!).toLocaleString()} সাশ্রয়!
                </span>
              )}
            </div>

            {/* Notify me when price drops Button */}
            <div>
              {activePriceAlert ? (
                <button
                  type="button"
                  onClick={() => setIsPriceDropModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-50 to-[#F8E8E9] hover:bg-amber-100 text-[#7A1238] border-2 border-[#D9A441] text-xs sm:text-sm font-bold font-bangla flex items-center justify-between gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    </span>
                    <Bell className="w-4 h-4 text-[#7A1238]" />
                    <span>
                      প্রাইস ড্রপ অ্যালার্ট সক্রিয় (কাঙ্ক্ষিত: <strong className="font-mono text-sm">৳{activePriceAlert.targetPrice.toLocaleString()}</strong>)
                    </span>
                  </div>
                  <span className="text-[11px] underline font-bold text-[#BE0750] shrink-0">পরিবর্তন করুন</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      setIsAuthOpen(true);
                    } else {
                      setIsPriceDropModalOpen(true);
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#F8E8E9] text-[#7A1238] border-2 border-dashed border-[#7A1238]/30 hover:border-[#BE0750] text-xs sm:text-sm font-bold font-bangla flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group active:scale-98"
                >
                  <Bell className="w-4 h-4 text-[#BE0750] group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                  <span>দাম কমলে নোটিফিকেশন দিন (Notify me when price drops)</span>
                </button>
              )}
            </div>


            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-gray-700 font-bangla">স্টক স্ট্যাটাস:</span>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  ইন স্টক ({product.stock} টি উপলব্ধ)
                </span>
              ) : (
                <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-bold">
                  স্টক শেষ
                </span>
              )}
            </div>

            {/* Size Variants & Interactive Size Guide Helper */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-800 font-bangla">
                  সাইজ নির্বাচন করুন:
                </label>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#7A1238] hover:text-[#BE0750] font-semibold bg-[#F8E8E9] hover:bg-[#BE0750]/15 px-2.5 py-1 rounded-xl transition-all cursor-pointer border border-[#7A1238]/15 shadow-2xs"
                >
                  <Ruler className="w-3.5 h-3.5 text-[#BE0750]" />
                  <span className="font-bangla">সাইজ গাইড ও ফিট অ্যাসিস্ট্যান্ট</span>
                </button>
              </div>

              {product.sizes.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        activeSize === size
                          ? 'bg-[#7A1238] text-white border-[#7A1238] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#7A1238]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-gray-500 font-bangla bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                  স্ট্যান্ডার্ড ফ্রি সাইজ (Free Size Standard)
                </div>
              )}
            </div>

            {/* Color Variants */}
            {product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-2 font-bangla">
                  রং নির্বাচন করুন:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        activeColor === col
                          ? 'bg-[#BE0750] text-white border-[#BE0750] shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#BE0750]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-gray-800 font-bangla">পরিমাণ:</span>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 hover:bg-gray-100 text-gray-700 font-bold"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3.5 py-1.5 hover:bg-gray-100 text-gray-700 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* AR Virtual Try-On Banner/Button for Jewellery and Accessories */}
            {(product.categoryId === 'jewellery' || product.categoryId === 'bags-accessories') && (
              <button
                type="button"
                onClick={() => openARTryOn(product)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D9A441] via-yellow-400 to-[#D9A441] text-stone-900 font-extrabold text-xs sm:text-sm font-bangla flex items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all hover:scale-[1.01] cursor-pointer border border-yellow-200"
              >
                <Camera className="w-4 h-4 text-stone-900" />
                <span>✨ লাইভ AR ভার্চুয়াল ট্রাই-অন (Live Camera Try-On)</span>
              </button>
            )}

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-2xl bg-[#7A1238] hover:bg-[#5a0a27] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4 text-[#F6E2B3]" />
                <span className="font-bangla">কার্ট-এ যোগ করুন</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#BE0750] to-[#9c0641] hover:from-[#d8085b] hover:to-[#be0750] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span className="font-bangla">এখনই অর্ডার করুন (Buy Now)</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-2 font-bangla">
              <Truck className="w-4 h-4 text-[#7A1238] shrink-0" />
              <span>ঢাকা সিটিতে ২৪-৪৮ ঘণ্টা</span>
            </div>
            <div className="flex items-center gap-2 font-bangla">
              <Truck className="w-4 h-4 text-[#7A1238] shrink-0" />
              <span>ঢাকার বাইরে ৪৮-৭২ ঘণ্টা</span>
            </div>
            <div className="flex items-center gap-2 font-bangla">
              <ShieldCheck className="w-4 h-4 text-[#7A1238] shrink-0" />
              <span>ক্যাশ অন ডেলিভারি (COD)</span>
            </div>
            <div className="flex items-center gap-2 font-bangla">
              <RotateCcw className="w-4 h-4 text-[#7A1238] shrink-0" />
              <span>৭ দিন সহজ রিটার্ন</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Description & Specs Section */}
      <div className="mt-14 pt-10 border-t border-[#7A1238]/10">
        <h3 className="text-xl font-bold font-bangla text-[#2A101A] mb-4">
          পণ্যের বিস্তারিত বিবরণ ও স্পেসিফিকেশন
        </h3>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-2xs space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed font-bangla whitespace-pre-line">
            {product.description}
          </p>

          {product.fabric && (
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-800">কাপড়ের ধরন / উপাদান:</span>
              <span className="text-gray-600 font-medium">{product.fabric}</span>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="pt-2 flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">ট্যাগ:</span>
              <div className="flex items-center gap-2">
                {product.tags.map(t => (
                  <span key={t} className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md text-[11px]">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Product Reviews Section */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#BE0750] uppercase tracking-wider font-serif-brand">
              <ShieldCheck className="w-4 h-4 text-[#D9A441]" />
              <span>Verified Customer Experience</span>
            </div>
            <h3 className="text-xl font-bold font-bangla text-[#2A101A] mt-0.5">
              কাস্টমার রিভিউ ও রেটিং ({productReviews.length})
            </h3>
            <p className="text-xs text-gray-500 font-bangla">
              প্রকৃত ক্রেতাদের অভিমত, ডেলিভারি অভিজ্ঞতা ও পণ্যের বিস্তারিত মূল্যায়ন
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {productReviews.length === 0 ? (
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-500 font-bangla text-xs shadow-2xs">
                এই পণ্যে এখনও কোনো রিভিউ জমা হয়নি। আপনি প্রথম রিভিউ দিন!
              </div>
            ) : (
              productReviews.map(rev => (
                <div key={rev.id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs hover:border-[#BE0750]/30 transition-all text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{rev.customerName}</span>
                      {rev.location && (
                        <span className="text-[11px] text-gray-500 font-bangla">({rev.location})</span>
                      )}
                      {rev.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>যাচাইকৃত ক্রেতা (Verified Purchase)</span>
                        </span>
                      )}
                      {rev.orderId && (
                        <span className="text-[10px] font-mono text-gray-400">
                          #{rev.orderId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-[#D9A441]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current text-[#D9A441]' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category Pill */}
                  {rev.category && (
                    <div className="mb-2">
                      <span className="inline-block bg-[#FFF9F2] text-[#7A1238] border border-[#D9A441]/30 text-[10px] font-bold px-2 py-0.5 rounded">
                        {rev.category === 'saree_fabric'
                          ? '🥻 শাড়ি ও ফেব্রিক কোয়ালিটি'
                          : rev.category === 'overseas_gift'
                          ? '✈️ প্রবাসী ও পরিবার উপহার'
                          : rev.category === 'bangladesh_delivery'
                          ? '🇧🇩 বাংলাদেশ হোম ডেলিভারি'
                          : rev.category === 'jewellery_craft'
                          ? '💎 জুয়েলারি ও কারুকার্য'
                          : rev.category === 'packaging_safety'
                          ? '📦 প্রিমিয়াম প্যাকেজিং'
                          : 'সাধারণ রিভিউ'}
                      </span>
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-gray-700 font-bangla leading-relaxed text-xs">
                    "{rev.comment}"
                  </p>

                  {/* Date & Helpful Counter */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-400">
                    <span>
                      {new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <button
                      onClick={() => toggleHelpfulReview(rev.id, currentUser?.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-[#F8E8E9] hover:text-[#7A1238] text-gray-600 font-medium transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>উপকারী ({rev.helpfulCount || 0})</span>
                    </button>
                  </div>

                  {/* Official Store Response */}
                  {rev.adminResponse && (
                    <div className="mt-3.5 p-3.5 rounded-xl bg-rose-50/70 border border-[#BE0750]/20 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#BE0750] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#7A1238] font-serif-brand">প্রেয়সী শপ অফিশিয়াল উত্তর</span>
                          <span className="text-[10px] text-gray-500 font-medium">({rev.adminResponse.authorRole})</span>
                        </div>
                        <p className="text-[11px] text-gray-800 mt-1 font-bangla leading-relaxed">
                          {rev.adminResponse.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Write a Review Box */}
          <div className="bg-white p-5 rounded-3xl border border-[#7A1238]/10 shadow-sm h-fit">
            <h4 className="font-bold text-sm text-gray-900 font-bangla mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#BE0750]" />
              <span>আপনার অভিজ্ঞতা ও রিভিউ লিখুন</span>
            </h4>

            {/* Delivered Purchase Verification Status Banner */}
            {deliveredPurchaseCheck.isVerified ? (
              <div className="p-2.5 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bangla flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">✓ ডেলিভারি নিশ্চিত হয়েছে! (অর্ডার #{deliveredPurchaseCheck.orderId})</strong>
                  <span>আপনার রিভিউতে 'যাচাইকৃত ক্রেতা' ব্যাজ প্রদর্শিত হবে।</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 mb-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 text-[10px] font-bangla">
                💡 টিপস: সফল ডেলিভারি সম্পন্ন অর্ডারের ক্রেতারা 'যাচাইকৃত ক্রেতা' বিশেষ ব্যাজ পান।
              </div>
            )}

            {reviewSubmitted && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bangla flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ধন্যবাদ! আপনার রিভিউ সফলভাবে প্রকাশিত হয়েছে।</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                  রেটিং নির্বাচন করুন:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-[#D9A441] hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= reviewRating ? 'fill-current text-[#D9A441]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-1.5">{reviewRating} স্টার</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                  রিভিউ ক্যাটাগরি:
                </label>
                <select
                  value={reviewCategory}
                  onChange={e => setReviewCategory(e.target.value as ReviewCategory)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#BE0750] bg-white font-medium"
                >
                  <option value="saree_fabric">🥻 শাড়ি ও কাপড়ের মান (Saree & Fabric Quality)</option>
                  <option value="bangladesh_delivery">🇧🇩 বাংলাদেশ হোম ডেলিভারি (Delivery Experience)</option>
                  <option value="overseas_gift">✈️ প্রবাসী ও পরিবার উপহার (Overseas & Gift)</option>
                  <option value="jewellery_craft">💎 জুয়েলারি ও কারুকার্য (Jewellery Craftsmanship)</option>
                  <option value="packaging_safety">📦 প্রিমিয়াম প্যাকেজিং ও সুরক্ষা (Packaging Safety)</option>
                  <option value="general">সাধারণ রিভিউ (General Feedback)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                  আপনার নাম:
                </label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  placeholder="যেমন: তানজিলা আহমেদ"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#BE0750]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1 font-bangla">
                  শহর / অবস্থান:
                </label>
                <input
                  type="text"
                  value={reviewLocation}
                  onChange={e => setReviewLocation(e.target.value)}
                  placeholder="যেমন: ঢাকা / লন্ডন, যুক্তরাজ্য"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#BE0750]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-gray-700 font-bangla">
                    আপনার রিভিউ / মতামত:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsTemplatesModalOpen(true)}
                    className="text-[10px] text-[#BE0750] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Lightbulb className="w-3 h-3 text-[#D9A441]" />
                    <span>নমুনা রিভিউ টেমপ্লেট</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="পণ্যের গুণগত মান, ডেলিভারি বা অনুভূতি সম্পর্কে লিখুন..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#BE0750] font-bangla"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                <Send className="w-3.5 h-3.5" />
                <span>রিভিউ জমা দিন</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sample Templates Inspiration Modal */}
        {isTemplatesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#D9A441]" />
                  <h3 className="text-sm font-bold text-gray-900 font-bangla">
                    নমুনা রিভিউ টেমপ্লেট (Inspiration Templates)
                  </h3>
                </div>
                <button
                  onClick={() => setIsTemplatesModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-gray-500 font-bangla mt-2">
                নিচের যেকোনো অনুপ্রেরণামূলক নমুনা বেছে নিয়ে নিজের অভিজ্ঞতার সাথে সহজে কাস্টমাইজ করুন:
              </p>

              <div className="space-y-3 mt-4 text-xs">
                {SAMPLE_REVIEW_TEMPLATES.map(tmpl => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className="p-3.5 rounded-2xl bg-gray-50 hover:bg-rose-50/60 border border-gray-200 hover:border-[#BE0750]/40 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#7A1238] font-bangla text-xs group-hover:text-[#BE0750]">
                        {tmpl.titleBn}
                      </span>
                      <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-200 font-semibold text-gray-600">
                        {tmpl.titleEn}
                      </span>
                    </div>
                    <p className="text-gray-700 font-bangla text-[11px] leading-relaxed line-clamp-2">
                      "{tmpl.sampleTextBn}"
                    </p>
                    <div className="mt-2 text-right">
                      <span className="text-[10px] text-[#BE0750] font-bold group-hover:underline">
                        এই টেমপ্লেটটি নির্বাচন করুন →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>


      {/* 5. Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-14 pt-10 border-t border-[#7A1238]/10">
          <h3 className="text-xl font-bold font-bangla text-[#2A101A] mb-6">
            একই ক্যাটাগরির অন্যান্য পছন্দের পণ্য
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Interactive Size Guide & Fit Assistant Modal */}
      <SizeGuideModal
        product={product}
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        onSelectSize={(newSize) => setSelectedSize(newSize)}
        currentSelectedSize={activeSize}
      />

      {/* Price Drop Alert Modal */}
      <PriceDropModal
        product={product}
        isOpen={isPriceDropModalOpen}
        onClose={() => setIsPriceDropModalOpen(false)}
      />
    </div>
  );
};

