import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'burgundy';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'burgundy',
  showTagline = true,
  className = ''
}) => {
  const isLight = variant === 'light';

  // Dimension scaling
  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const titleSizes = {
    sm: 'text-base tracking-[0.2em]',
    md: 'text-xl md:text-2xl tracking-[0.25em]',
    lg: 'text-3xl md:text-4xl tracking-[0.3em]'
  };

  const bnSizes = {
    sm: 'text-[11px]',
    md: 'text-xs md:text-sm',
    lg: 'text-base md:text-lg'
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`}>
      {/* Signature Vector Luxury Emblem */}
      <div className={`relative shrink-0 ${emblemSizes[size]} rounded-xl p-1 flex items-center justify-center bg-gradient-to-br from-[#7A1238] via-[#5C0B28] to-[#3B0518] shadow-sm ring-1 ring-[#D9A441]/50`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          <circle cx="50" cy="50" r="46" stroke="#D9A441" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
          <circle cx="50" cy="50" r="41" stroke="#F6E2B3" strokeWidth="0.8" opacity="0.4" />
          {/* Crown */}
          <path d="M 32 30 L 38 40 L 50 28 L 62 40 L 68 30 L 64 46 L 36 46 Z" fill="#D9A441" />
          <circle cx="32" cy="29" r="2.5" fill="#FFF9F2" />
          <circle cx="50" cy="27" r="3" fill="#FFF9F2" />
          <circle cx="68" cy="29" r="2.5" fill="#FFF9F2" />
          {/* Monogram P & Heart */}
          <path
            d="M 37 46 L 53 46 C 63 46 68 53 68 61 C 68 69 62 76 52 76 L 44 76 L 44 86 L 37 86 Z M 44 53 L 52 53 C 58 53 61 56 61 61 C 61 66 58 69 52 69 L 44 69 Z"
            fill="#F6E2B3"
          />
          <path
            d="M 58 55 C 58 52 61 50 64 50 C 67 50 69 52 69 54 C 69 59 63 64 58 67 C 53 64 47 59 47 54 C 47 52 49 50 52 50 C 55 50 58 52 58 55 Z"
            fill="#BE0750"
            transform="scale(0.5) translate(40, 35)"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span
            className={`font-serif-brand font-bold ${titleSizes[size]} ${
              isLight ? 'text-white' : 'text-[#7A1238]'
            }`}
          >
            PREYOSHI
          </span>
          <span
            className={`font-bangla font-semibold ${bnSizes[size]} ${
              isLight ? 'text-[#F8E8E9]' : 'text-[#BE0750]'
            }`}
          >
            প্রেয়সী শপ
          </span>
        </div>
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
            <span
              className={`text-[9px] sm:text-[10px] tracking-[0.16em] uppercase font-medium ${
                isLight ? 'text-[#D9A441]' : 'text-[#7A1238]/80'
              }`}
            >
              Your Style
            </span>
            <span className="text-[#BE0750] text-[10px] animate-pulse">♥</span>
            <span
              className={`text-[9px] sm:text-[10px] tracking-[0.16em] uppercase font-medium ${
                isLight ? 'text-[#D9A441]' : 'text-[#7A1238]/80'
              }`}
            >
              Our Priority
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
