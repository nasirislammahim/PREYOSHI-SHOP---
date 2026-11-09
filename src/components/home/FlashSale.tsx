import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';

export const FlashSale: React.FC = () => {
  const { products } = useStore();

  // Filter flash sale products
  const flashSaleProducts = products.filter(p => p.isFlashSale && p.status === 'active');

  // Countdown timer: 2 days, 14 hours, 38 mins, 40 secs
  const [timeLeft, setTimeLeft] = useState({
    hours: 28,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (flashSaleProducts.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-br from-[#F8E8E9] via-[#FFF9F2] to-[#F8E8E9] border-y border-[#7A1238]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with Countdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#BE0750] text-white flex items-center justify-center shadow-md animate-pulse">
              <Flame className="w-5 h-5 text-[#D9A441]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#BE0750] tracking-wider uppercase font-serif-brand">
                  LIMITED TIME OFFER
                </span>
                <span className="bg-[#BE0750] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  হট ডিল
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-bangla text-[#2A101A] mt-0.5">
                ফ্ল্যাশ সেল ও স্পেশাল ডিসকাউন্ট
              </h2>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#D9A441]/40 shadow-xs self-start md:self-auto">
            <Clock className="w-4 h-4 text-[#7A1238] shrink-0" />
            <span className="text-xs text-gray-500 font-medium">অফার শেষ হতে বাকি:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm text-white">
              <span className="bg-[#7A1238] px-2 py-1 rounded-md">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-gray-600">:</span>
              <span className="bg-[#7A1238] px-2 py-1 rounded-md">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-gray-600">:</span>
              <span className="bg-[#BE0750] px-2 py-1 rounded-md">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {flashSaleProducts.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
