import React from 'react';
import { SlidersHorizontal, X, ArrowRight, Eye } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ProductCompareDock: React.FC = () => {
  const { compareList, products, removeFromCompare, clearCompare, setIsCompareModalOpen } = useStore();

  if (compareList.length === 0) return null;

  const compareProducts = compareList
    .map(id => products.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-[#7A1238] p-3 sm:p-4 animate-slide-up flex flex-col sm:flex-row items-center justify-between gap-3">
      {/* Product Thumbnails Preview */}
      <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#7A1238] uppercase font-serif-brand shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-[#BE0750]" />
          <span className="hidden md:inline">পণ্য তুলনা ({compareList.length}/4):</span>
        </div>

        <div className="flex items-center gap-2">
          {compareProducts.map(p => (
            <div key={p.id} className="relative group shrink-0">
              <img
                src={p.images[0]}
                alt={p.nameEn}
                className="w-10 h-12 object-cover rounded-lg border border-gray-200 shadow-2xs"
              />
              <button
                onClick={() => removeFromCompare(p.id)}
                className="absolute -top-1.5 -right-1.5 bg-[#BE0750] text-white rounded-full p-0.5 hover:bg-black transition-colors"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Placeholders if less than 2 items */}
          {compareList.length === 1 && (
            <div className="w-10 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-medium text-center p-1 leading-none">
              +১টি দিন
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        <button
          onClick={clearCompare}
          className="px-3 py-1.5 text-xs text-gray-500 hover:text-red-600 font-semibold transition-colors cursor-pointer"
        >
          খালি করুন
        </button>

        <button
          onClick={() => setIsCompareModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#7A1238] hover:bg-[#BE0750] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <span>তুলনা দেখুন ({compareList.length})</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F6E2B3]" />
        </button>
      </div>
    </div>
  );
};
