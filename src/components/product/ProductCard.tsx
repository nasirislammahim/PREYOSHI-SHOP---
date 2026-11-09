import { Heart, ShoppingBag, Eye, Star, Check, SlidersHorizontal, Camera } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProductId,
    setCurrentView,
    setQuickViewProduct,
    addToCompare,
    removeFromCompare,
    isInCompare,
    openARTryOn
  } = useStore();

  const isWished = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const currentPrice = product.discountPrice ?? product.regularPrice;
  const discountPercent = product.discountPrice
    ? Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100)
    : 0;

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setCurrentView('product_detail');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.sizes.length > 1 || product.colors.length > 1) {
      setQuickViewProduct(product);
    } else {
      addToCart(product, 1);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-[#7A1238]/10 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* 1. Image Container with Badges */}
      <div className="relative aspect-3/4 sm:aspect-4/5 overflow-hidden bg-[#F8E8E9]/30">
        <img
          src={product.images[0]}
          alt={product.nameEn}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="bg-[#BE0750] text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-[#7A1238] text-[#F6E2B3] text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
              নতুন
            </span>
          )}
          {product.isDemo && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-semibold px-1.5 py-0.5 rounded-sm shadow-xs">
              DEMO DATA
            </span>
          )}
        </div>

        {/* Action icons on top right: Wishlist & Compare */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 rounded-full transition-colors shadow-sm ${
              isWished
                ? 'bg-[#BE0750] text-white'
                : 'bg-white/80 backdrop-blur-xs text-gray-700 hover:text-[#BE0750] hover:bg-white'
            }`}
            title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleToggleCompare}
            className={`p-2 rounded-full transition-colors shadow-sm ${
              inCompare
                ? 'bg-[#7A1238] text-[#F6E2B3]'
                : 'bg-white/80 backdrop-blur-xs text-gray-700 hover:text-[#7A1238] hover:bg-white'
            }`}
            title={inCompare ? 'Remove from Compare' : 'Compare Product'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {(product.categoryId === 'jewellery' || product.categoryId === 'bags-accessories') && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openARTryOn(product);
              }}
              className="p-2 rounded-full transition-all shadow-sm bg-[#D9A441] text-stone-900 hover:bg-yellow-400 font-bold hover:scale-110"
              title="ক্যামেরায় ভার্চুয়াল ট্রাই-অন করুন (AR Try-On)"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick View Button (Desktop overlay) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          className="absolute bottom-2.5 right-2.5 hidden sm:flex items-center gap-1.5 bg-white/90 hover:bg-white text-[#7A1238] text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="Quick View"
        >
          <Eye className="w-3.5 h-3.5 text-[#BE0750]" />
          <span>কুইক ভিউ</span>
        </button>

        {/* Out of Stock Ribbon */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-2xs flex items-center justify-center">
            <span className="bg-white/90 text-gray-900 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-md">
              স্টক শেষ (Out of Stock)
            </span>
          </div>
        )}
      </div>

      {/* 2. Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
            <div className="flex items-center text-[#D9A441]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 text-[11px] font-bold text-gray-800">{product.rating}</span>
            </div>
            <span>·</span>
            <span className="text-[10px] text-gray-400">({product.reviewCount} রিভিউ)</span>
          </div>

          {/* Bengali Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 font-bangla line-clamp-1 group-hover:text-[#BE0750] transition-colors">
            {product.nameBn}
          </h3>

          {/* English Title */}
          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5 font-light">
            {product.nameEn}
          </p>

          {/* Available Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] text-gray-400">রং:</span>
              <span className="text-[10px] font-medium text-gray-600 truncate">
                {product.colors.slice(0, 2).join(', ')}
                {product.colors.length > 2 ? ` +${product.colors.length - 2}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* 3. Price & Add to Cart */}
        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#7A1238]">
                ৳{currentPrice.toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                  ৳{product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[9px] text-amber-700 font-medium">
                মাত্র {product.stock} টি বাকি!
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              product.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#7A1238] hover:bg-[#BE0750] text-white active:scale-95'
            }`}
            title="Add to Cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">অর্ডার</span>
          </button>
        </div>
      </div>
    </div>
  );
};
