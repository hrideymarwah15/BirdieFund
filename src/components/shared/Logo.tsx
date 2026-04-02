import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'dark',
  size = 'md'
}) => {
  const isWhite = variant === 'white';
  
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`flex items-center gap-3.5 group select-none ${className}`}>
      {/* Premium Soaring Mark */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center transition-transform duration-500 hover:scale-105`}>
        {/* The Mark */}
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md relative z-10">
          <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isWhite ? '#ffffff' : '#16a34a'} />
              <stop offset="100%" stopColor={isWhite ? '#f0fdf4' : '#15803d'} />
            </linearGradient>
          </defs>

          {/* Main 'B' Mark - Engineered for legibility and flow */}
          <path 
            d="M12 8C12 8 28 8 28 15.5C28 23 20 21 20 21C20 21 30 19 30 28.5C30 38 12 38 12 38V8Z" 
            stroke="url(#logoGradient)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Focal 'Birdie' Dot - The Point of Impact */}
          <circle 
            cx="17" cy="30" r="3" 
            fill={isWhite ? '#ffffff' : '#ca8a04'} 
          />
        </svg>
      </div>

      {/* Typography Hierarchy - Perfectly centered */}
      <div className="flex flex-col -space-y-0.5 justify-center py-1">
        <span className={`text-xl sm:text-2xl font-black tracking-tighter leading-none font-[family-name:var(--font-heading)] ${
          isWhite ? 'text-white' : 'text-text'
        }`}>
          Birdie<span className={isWhite ? 'text-white/90' : 'text-green'}>Fund</span>
        </span>
        <div className="flex items-center gap-2 opacity-60">
          <span className={`text-[9px] uppercase tracking-[0.3em] font-bold ${
            isWhite ? 'text-white' : 'text-text'
          }`}>
            Elite Membership
          </span>
        </div>
      </div>
    </div>
  );
};
