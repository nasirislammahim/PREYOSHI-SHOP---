import React, { useState } from 'react';
import { X, Star, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, setCurrentView, setIsCartOpen } = useStore();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  if (!quickViewProduct) return null;

  const currentPrice = quickViewProduct.discountPrice ?? quickViewProduct.regularPrice;
  const activeSize = selectedSize || (quickViewProduct.sizes[0] ?? '');
  const activeColor = selectedColor || (quickViewProduct.colors[0] ?? '');

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, activeSize, activeColor);
    setQuickViewProduct(null);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(quickViewProduct, quantity, activeSize, activeColor);
    setQuickViewProduct(null);
    setCurrentView('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#FFF9F2] shadow-2xl border border-[#7A1238]/20 overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 shadow-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Images Gallery */}
        <div className="md:w-1/2 p-4 sm:p-6 bg-[#F8E8E9]/40 flex flex-col justify-between">
          <div className="aspect-4/5 rounded-2xl overflow-hidden bg-white shadow-xs">
            <img
              src={quickViewProduct.images[activeImgIndex] || quickViewProduct.images[0]}
              alt={quickViewProduct.nameEn}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {quickViewProduct.images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
              {quickViewProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImgIndex === idx ? 'border-[#BE0750] scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Actions & Details */}
        <div className="md:w-1/2 p-5 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-[#D9A441]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-xs font-bold text-gray-800 ml-1">{quickViewProduct.rating}</span>
              </div>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500 font-bangla">{quickViewProduct.reviewCount} টি কাস্টমার রিভিউ</span>
            </div>

            {/* Names */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-bangla text-[#2A101A] leading-snug">
                {quickViewProduct.nameBn}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-serif-brand mt-0.5">
                {quickViewProduct.nameEn}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-extrabold text-[#7A1238]">
                ৳{currentPrice.toLocaleString()}
              </span>
              {quickViewProduct.discountPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ৳{quickViewProduct.regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Sizes */}
            {quickViewProduct.sizes.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  সাইজ নির্বাচন করুন:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        activeSize === size
                          ? 'bg-[#7A1238] text-white border-[#7A1238]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#7A1238]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {quickViewProduct.colors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 font-bangla">
                  রং নির্বাচন করুন:
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.colors.map(col => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                        activeColor === col
                          ? 'bg-[#BE0750] text-white border-[#BE0750]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#BE0750]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-semibold text-gray-700 font-bangla">পরিমাণ:</span>
              <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 hover:bg-gray-100 text-gray-700 font-bold"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(quickViewProduct.stock, quantity + 1))}
                  className="px-3 py-1 hover:bg-gray-100 text-gray-700 font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-gray-500 font-bangla">
                (স্টক এ আছে: {quickViewProduct.stock} টি)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-6 mt-4 border-t border-gray-200">
            <button
              onClick={handleAddToCart}
              disabled={quickViewProduct.stock <= 0}
              className="w-full py-3 rounded-2xl bg-[#7A1238] hover:bg-[#5f0c2a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>কার্ট-এ যোগ করুন</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={quickViewProduct.stock <= 0}
              className="w-full py-3 rounded-2xl bg-[#BE0750] hover:bg-[#9a0640] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span>এখনই কিনুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
