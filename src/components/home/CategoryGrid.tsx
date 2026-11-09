import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const { categories, setSelectedCategory, setCurrentView } = useStore();

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentView('store');
    const catalogEl = document.getElementById('product-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#BE0750] uppercase tracking-wider mb-1 font-serif-brand">
            <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>আমাদের ক্যাটাগরি সমূহ</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-bangla text-[#2A101A]">
            পছন্দের কালেকশন বেছে নিন
          </h2>
        </div>
        <p className="text-xs text-gray-500 font-bangla max-w-sm">
          শাড়ি, রেডিমেড পোশাক, কুন্দন জুয়েলারি, কসমেটিকস ও দৈনন্দিন লাইফস্টাইল পণ্য
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat.id)}
            className="group relative rounded-2xl overflow-hidden aspect-4/5 text-left border border-[#7A1238]/10 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-end p-3 cursor-pointer bg-black/10"
          >
            {/* Background Image */}
            <img
              src={cat.image}
              alt={cat.nameEn}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A101A] via-[#2A101A]/50 to-transparent group-hover:via-[#5C0B28]/60 transition-colors" />

            {/* Category Text */}
            <div className="relative z-10 text-white">
              <span className="text-[10px] uppercase tracking-wider text-[#D9A441] font-semibold">
                {cat.nameEn}
              </span>
              <h3 className="text-sm font-bold font-bangla leading-tight group-hover:text-[#F6E2B3] transition-colors mt-0.5">
                {cat.nameBn}
              </h3>
              <div className="flex items-center justify-between text-[10px] text-gray-300 mt-1 opacity-80 group-hover:opacity-100">
                <span>{cat.itemCount ? `${cat.itemCount} টি পণ্য` : 'কালেকশন'}</span>
                <ArrowRight className="w-3 h-3 text-[#D9A441] transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
