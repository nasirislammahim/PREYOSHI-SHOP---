import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { banners, setSelectedCategory, setCurrentView } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide rotation
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const activeBanner = banners[currentSlide];

  const handleCta = (linkCategory?: string) => {
    if (linkCategory) {
      setSelectedCategory(linkCategory);
    }
    setCurrentView('store');
    const catalogEl = document.getElementById('product-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#2A101A]">
      {/* 1. Main Banner Slide */}
      <div className="relative min-h-[380px] sm:min-h-[460px] md:min-h-[520px] flex items-center">
        {/* Background Image with Luxury Burgundy & Dark Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeBanner.image}
            alt={activeBanner.titleEn}
            className="w-full h-full object-cover object-center opacity-35 filter brightness-90 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2A101A] via-[#5C0B28]/90 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 w-full">
          <div className="max-w-2xl text-white space-y-4 sm:space-y-6">
            {/* Badge */}
            {activeBanner.badgeText && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BE0750] text-[#FFF9F2] text-xs font-bold tracking-wider uppercase shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
                <span>{activeBanner.badgeText}</span>
              </div>
            )}

            {/* Bengali Headline */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-bangla text-white leading-tight drop-shadow-md">
              {activeBanner.titleBn}
            </h1>

            {/* English Title & Subtitle */}
            <h2 className="text-sm sm:text-lg md:text-xl font-serif-brand font-medium text-[#F6E2B3] tracking-wide">
              {activeBanner.titleEn}
            </h2>

            <p className="text-xs sm:text-sm text-gray-200 font-bangla max-w-lg leading-relaxed">
              {activeBanner.subtitleBn}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleCta(activeBanner.link)}
                className="bg-gradient-to-r from-[#BE0750] to-[#7A1238] hover:from-[#d8085b] hover:to-[#911543] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer group ring-2 ring-[#D9A441]/40"
              >
                <span>এখনই শপিং করুন</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#D9A441]" />
              </button>

              <button
                onClick={() => handleCta('saree')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white border border-[#D9A441]/60 font-semibold text-xs sm:text-sm px-5 py-3 rounded-full transition-colors cursor-pointer"
              >
                জামদানি ও কাতান শাড়ি
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slider Navigation Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#BE0750] text-white flex items-center justify-center transition-colors backdrop-blur-xs cursor-pointer"
              title="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentSlide(prev => (prev + 1) % banners.length)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#BE0750] text-white flex items-center justify-center transition-colors backdrop-blur-xs cursor-pointer"
              title="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots Pagination */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 transition-all rounded-full cursor-pointer ${
                    index === currentSlide ? 'w-8 bg-[#D9A441]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Fast Delivery / Trust Strip */}
      <div className="bg-[#7A1238] border-t border-[#D9A441]/30 py-3 text-white text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Truck className="w-4 h-4 text-[#D9A441] shrink-0" />
            <span className="font-bangla">ক্যাশ অন ডেলিভারি (COD)</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D9A441] shrink-0" />
            <span className="font-bangla">১০০% কোয়ালিটি গ্যারান্টি</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Clock className="w-4 h-4 text-[#D9A441] shrink-0" />
            <span className="font-bangla">২৪-৭২ ঘণ্টায় দ্রুত ডেলিভারি</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-[#D9A441] shrink-0" />
            <span className="font-bangla">প্রিমিয়াম কালেকশন</span>
          </div>
        </div>
      </div>
    </section>
  );
};
