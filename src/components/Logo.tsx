import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Custom Icon: Location Pin + Search Symbol */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#1b4931] to-[#0e2b1e] p-1.5 shadow-md shadow-emerald-950/20`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Location Pin Outer */}
          <path
            d="M24 4C15.163 4 8 11.163 8 20C8 30.5 22.5 43.2 23.12 43.74C23.63 44.18 24.37 44.18 24.88 43.74C25.5 43.2 40 30.5 40 20C40 11.163 32.837 4 24 4Z"
            fill="#FAF6EC"
          />
          {/* Pin Center Core */}
          <circle cx="24" cy="20" r="10" fill="#133E2B" />
          {/* Magnifier Lens */}
          <circle
            cx="22"
            cy="18"
            r="5"
            stroke="#34D399"
            strokeWidth="2.2"
            fill="none"
          />
          {/* Magnifier Handle in Coral */}
          <path
            d="M26 22L29.5 25.5"
            stroke="#F43F5E"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Small spark */}
          <circle cx="28" cy="13" r="1" fill="#34D399" />
        </svg>
      </div>

      <div className="flex flex-col leading-tight">
        <div className={`font-extrabold tracking-tight font-display flex items-center gap-1 ${titleSizes[size]}`}>
          <span className="text-[#133E2B]">FindIt</span>
          <span className="text-emerald-600">Campus</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block self-end mb-1"></span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
            Poona College
          </span>
        )}
      </div>
    </div>
  );
};
