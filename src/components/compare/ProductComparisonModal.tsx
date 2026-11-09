import React from 'react';
import {
  X, SlidersHorizontal, ShoppingBag, Star, Check,
  AlertCircle, ArrowRight, Trash2, Plus
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';

export const ProductComparisonModal: React.FC = () => {
  const {
    compareList,
    products,
    removeFromCompare,
    clearCompare,
    isCompareModalOpen,
    setIsCompareModalOpen,
    addToCart,
    setIsCartOpen,
    setSelectedProductId,
    setCurrentView
  } = useStore();

  if (!isCompareModalOpen) return null;

  const compareProducts = compareList
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  const handleViewProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsCompareModalOpen(false);
    setCurrentView('product_detail');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#FFF9F2] rounded-3xl p-5 sm:p-8 shadow-2xl border border-[#7A1238]/20 my-6 max-h-[92vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7A1238] text-white flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5 text-[#D9A441]" />
            </div>
            <div>
              <h3 className="font-bold font-bangla text-base sm:text-lg text-[#2A101A]">
                পণ্যের তুলনামূলক বিবরণী (Product Comparison)
              </h3>
              <p className="text-xs text-gray-500 font-bangla">
                মূল্য, উপাদান, সাইজ, স্টক ও স্পেসিফিকেশন পাশাপাশি তুলনা করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
              >
                সব মুছুন
              </button>
            )}
            <button
              onClick={() => setIsCompareModalOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body / Side-by-Side Comparison Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto py-4">
          {compareProducts.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-bangla space-y-3">
              <AlertCircle className="w-10 h-10 text-[#BE0750] mx-auto opacity-50" />
              <p className="text-sm font-semibold">তুলনা করার জন্য কোনো পণ্য নির্বাচন করা হয়নি।</p>
              <p className="text-xs text-gray-400">
                পণ্যের কার্ডে থাকা "তুলনা করুন" বাটনে ক্লিক করে পণ্য নির্বাচন করুন।
              </p>
            </div>
          ) : (
            <div className="min-w-[600px] border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-2xs divide-y divide-gray-100">
              {/* Row 1: Product Overview & Images */}
              <div className="grid" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, minmax(180px, 1fr))` }}>
                <div className="p-4 bg-gray-50/70 font-bold text-xs text-gray-500 flex items-center font-bangla">
                  পণ্য বিবরণ
                </div>
                {compareProducts.map(prod => {
                  const currentPrice = prod.discountPrice ?? prod.regularPrice;
                  return (
                    <div key={prod.id} className="p-4 relative flex flex-col justify-between border-l border-gray-100">
                      <button
                        onClick={() => removeFromCompare(prod.id)}
                        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 rounded-full hover:bg-gray-50"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-2">
                        <img
                          src={prod.images[0]}
                          alt={prod.nameEn}
                          className="w-full aspect-4/5 object-cover rounded-xl border border-gray-100 shadow-2xs cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleViewProduct(prod.id)}
                        />
                        <span className="text-[10px] uppercase font-bold text-[#D9A441] tracking-wider">
                          {prod.categoryId}
                        </span>
                        <h4
                          onClick={() => handleViewProduct(prod.id)}
                          className="font-bold text-xs text-gray-900 font-bangla line-clamp-2 hover:text-[#BE0750] cursor-pointer"
                        >
                          {prod.nameBn}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{prod.nameEn}</p>
                      </div>

                      <button
                        onClick={() => handleAddToCart(prod)}
                        disabled={prod.stock <= 0}
                        className={`mt-3 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          prod.stock <= 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#7A1238] hover:bg-[#BE0750] text-white shadow-xs'
                        }`}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#F6E2B3]" />
                        <span className="font-bangla">কার্ট-এ নিন</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Row 2: Price & Discounts */}
              <div className="grid" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, minmax(180px, 1fr))` }}>
                <div className="p-3.5 bg-gray-50/70 font-semibold text-xs text-gray-700 flex items-center font-bangla">
                  মূল্য (Price)
                </div>
                {compareProducts.map(prod => {
                  const currentPrice = prod.discountPrice ?? prod.regularPrice;
                  return (
                    <div key={prod.id} className="p-3.5 border-l border-gray-100 text-xs">
                      <div className="text-sm font-extrabold text-[#7A1238]">
                        ৳{currentPrice.toLocaleString()}
                      </div>
                      {prod.discountPrice && (
                        <div className="text-[11px] text-gray-400 line-through">
                          ৳{prod.regularPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Row 3: Stock Status */}
              <div className="grid" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, minmax(180px, 1fr))` }}>
                <div className="p-3.5 bg-gray-50/70 font-semibold text-xs text-gray-700 flex items-center font-bangla">
                  স্টক অবস্থা
                </div>
                {compareProducts.map(prod => (
                  <div key={prod.id} className="p-3.5 border-l border-gray-100 text-xs">
                    {prod.stock > 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>উপলব্ধ ({prod.stock} টি)</span>
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold text-[11px]">স্টক শেষ</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Row 4: Fabric / Material */}
              <div className="grid" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, minmax(180px, 1fr))` }}>
                <div className="p-3.5 bg-gray-50/70 font-semibold text-xs text-gray-700 flex items-center font-bangla">
                  উপাদান / ফেব্রিক
                </div>
                {compareProducts.map(prod => (
                  <div key={prod.id} className="p-3.5 border-l border-gray-100 text-xs text-gray-700 font-bangla">
                    {prod.fabric || 'প্রিমিয়াম কোয়ালিটি ফ্যাব্রিক'}
                  </div>
                ))}
              </div>

              {/* Row 5: Sizes */}
              <div className="grid" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, minmax(180px, 1fr))` }}>
                <div className="p-3.5 bg-gray-50/70 font-semibold text-xs text-gray-700 flex items-center font-bangla">
                  উপলব্ধ সাইজ
                </div>
                {compareProducts.map(prod => (
                  <div key={prod.id} className="p-3.5 border-l border-gray-100 text-xs">
                    {prod.sizes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {prod.sizes.map(s => (
                          <span key={s} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[11px]">স্ট্যান্ডার্ড সাইজ</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Row 6: Colors */}
              <div className="grid" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, minmax(180px, 1fr))` }}>
                <div className="p-3.5 bg-gray-50/70 font-semibold text-xs text-gray-700 flex items-center font-bangla">
                  রং (Colors)
                </div>
                {compareProducts.map(prod => (
                  <div key={prod.id} className="p-3.5 border-l border-gray-100 text-xs">
                    {prod.colors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {prod.colors.map(c => (
                          <span key={c} className="bg-[#F8E8E9] text-[#7A1238] px-2 py-0.5 rounded text-[10px] font-medium">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[11px]">ছবি অনুযায়ী</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Row 7: Customer Rating */}
              <div className="grid" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, minmax(180px, 1fr))` }}>
                <div className="p-3.5 bg-gray-50/70 font-semibold text-xs text-gray-700 flex items-center font-bangla">
                  কাস্টমার রেটিং
                </div>
                {compareProducts.map(prod => (
                  <div key={prod.id} className="p-3.5 border-l border-gray-100 text-xs">
                    <div className="flex items-center text-[#D9A441]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="ml-1 font-bold text-gray-800">{prod.rating}</span>
                      <span className="text-[11px] text-gray-400 ml-1">({prod.reviewCount})</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 8: SKU & Identifier */}
              <div className="grid" style={{ gridTemplateColumns: `140px repeat(${compareProducts.length}, minmax(180px, 1fr))` }}>
                <div className="p-3.5 bg-gray-50/70 font-semibold text-xs text-gray-700 flex items-center font-bangla">
                  SKU কোড
                </div>
                {compareProducts.map(prod => (
                  <div key={prod.id} className="p-3.5 border-l border-gray-100 text-xs font-mono text-gray-500">
                    {prod.sku}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 shrink-0">
          <p className="font-bangla">
            টিপস: যেকোনো পণ্যের বিস্তারিত দেখতে ছবির ওপর ক্লিক করুন।
          </p>
          <button
            onClick={() => setIsCompareModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
