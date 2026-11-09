import React from 'react';
import { History } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';

export const RecentlyViewed: React.FC = () => {
  const { recentlyViewed } = useStore();

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 border-t border-[#7A1238]/10">
      <div className="flex items-center gap-2 text-xs font-bold text-[#7A1238] uppercase tracking-wider mb-2 font-serif-brand">
        <History className="w-4 h-4 text-[#D9A441]" />
        <span>আপনার সম্প্রতি দেখা পণ্যসমূহ</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold font-bangla text-[#2A101A] mb-6">
        Recently Viewed Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {recentlyViewed.slice(0, 4).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
