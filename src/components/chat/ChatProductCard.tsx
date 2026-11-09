import React from 'react';
import { ShoppingBag, Eye, Zap, Camera, Check, AlertCircle, Sparkles, Star } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ChatProductCardProps {
  product: Product;
  onSelectProduct?: (productId: string) => void;
}

export const ChatProductCard: React.FC<ChatProductCardProps> = ({ product, onSelectProduct }) => {
  const {
    addToCart,
    setIsCartOpen,
    setCurrentView,
    setSelectedProductId,
    setIsChatOpen,
    openARTryOn
  } = useStore();

  const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
  const currentPrice = product.discountPrice ?? product.regularPrice;
  const hasDiscount = Boolean(product.discountPrice && product.discountPrice < product.regularPrice);
  const discountAmount = hasDiscount ? product.regularPrice - currentPrice : 0;
  const discountPercent = hasDiscount ? Math.round((discountAmount / product.regularPrice) * 100) : 0;

  const handleViewDetails = () => {
    setSelectedProductId(product.id);
    setCurrentView('product_detail');
    setIsChatOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onSelectProduct?.(product.id);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const defaultSize = product.sizes?.[0];
    const defaultColor = product.colors?.[0];
    addToCart(product, 1, defaultSize, defaultColor);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const defaultSize = product.sizes?.[0];
    const defaultColor = product.colors?.[0];
    addToCart(product, 1, defaultSize, defaultColor);
    setIsChatOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all p-3 space-y-2.5 max-w-sm overflow-hidden">
      {/* Top Media & Main Details */}
      <div className="flex gap-3">
        <div className="relative shrink-0 w-20 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 group cursor-pointer" onClick={handleViewDetails}>
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'}
            alt={product.nameEn}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-1 left-1 bg-[#BE0750] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold">
                ID: {product.id}
              </span>
              {product.rating > 0 && (
                <div className="flex items-center gap-0.5 text-[10px] text-amber-500 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
              )}
            </div>

            <h5
              onClick={handleViewDetails}
              className="font-bold text-xs font-bangla text-gray-900 hover:text-[#7A1238] transition-colors cursor-pointer line-clamp-1 mt-0.5"
            >
              {product.nameBn}
            </h5>
            <p className="text-[11px] text-gray-500 truncate">{product.nameEn}</p>
          </div>

          {/* Pricing & Stock Status */}
          <div className="mt-1.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <strong className="text-sm font-black text-[#7A1238] font-mono">
                ৳{currentPrice.toLocaleString()}
              </strong>
              {hasDiscount && (
                <span className="text-[11px] text-gray-400 line-through font-mono">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
              {hasDiscount && (
                <span className="text-[10px] text-emerald-700 font-bangla font-semibold">
                  (ছাড়: ৳{discountAmount.toLocaleString()})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bangla">
                  <AlertCircle className="w-3 h-3" />
                  <span>স্টক আউট</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bangla">
                  <Check className="w-3 h-3" />
                  <span>স্টকে আছে ({product.stock} টি)</span>
                </span>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <span className="text-[10px] text-gray-400 font-bangla">
                  সাইজ: {product.sizes[0]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description Snippet */}
      {product.description && (
        <p className="text-[11px] text-gray-600 font-bangla line-clamp-2 leading-relaxed bg-[#FFF9F2] p-2 rounded-xl border border-[#D9A441]/20">
          {product.description}
        </p>
      )}

      {/* Action Buttons: View Details, Add to Cart, Buy Now */}
      <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-gray-100">
        <button
          onClick={handleViewDetails}
          className="px-2 py-1.5 rounded-xl border border-gray-200 hover:border-[#7A1238] text-gray-700 hover:text-[#7A1238] text-[11px] font-bold font-bangla transition-colors flex items-center justify-center gap-1 cursor-pointer"
          title="সম্পূর্ণ বিবরণ দেখুন"
        >
          <Eye className="w-3 h-3" />
          <span>বিবরণ</span>
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="px-2 py-1.5 rounded-xl bg-gray-100 hover:bg-[#F8E8E9] text-[#7A1238] hover:text-[#BE0750] disabled:bg-gray-100 disabled:text-gray-400 text-[11px] font-bold font-bangla transition-colors flex items-center justify-center gap-1 cursor-pointer"
          title="শপিং কার্ট-এ যুক্ত করুন"
        >
          <ShoppingBag className="w-3 h-3" />
          <span>কার্ট-এ</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="px-2 py-1.5 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white disabled:bg-gray-300 text-[11px] font-bold font-bangla transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
          title="সরাসরি চেকআউট পেজে যান"
        >
          <Zap className="w-3 h-3 text-[#D9A441]" />
          <span>কিনুন</span>
        </button>
      </div>

      {/* AR Try-On shortcut for Jewellery */}
      {product.categoryId === 'jewellery' && (
        <button
          onClick={() => {
            openARTryOn(product);
            setIsChatOpen(false);
          }}
          className="w-full py-1 rounded-xl bg-gradient-to-r from-[#D9A441]/20 to-[#BE0750]/20 text-[#7A1238] hover:text-[#BE0750] text-[10px] font-bold font-bangla flex items-center justify-center gap-1 transition-colors border border-[#D9A441]/30 cursor-pointer"
        >
          <Camera className="w-3 h-3 text-[#BE0750]" />
          <span>ক্যামেরা দিয়ে ট্রাই-অন করে দেখুন</span>
        </button>
      )}
    </div>
  );
};
