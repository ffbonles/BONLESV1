import React from 'react';

interface BonlesLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'mark' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightBg?: boolean;
}

export const BonlesLogo: React.FC<BonlesLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
  lightBg = false,
}) => {
  // Height / scale classes
  const sizeMap = {
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]', height: 36 },
    md: { icon: 'w-11 h-11', text: 'text-xl', sub: 'text-[11px]', height: 46 },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm', height: 64 },
    xl: { icon: 'w-24 h-24', text: 'text-5xl', sub: 'text-lg', height: 96 },
  };

  const currentSize = sizeMap[size];

  // The official vector key visual emblem of Bonles Food (Fish wave, BFF stamp, Red & Green dynamic curve)
  const LogoMark = (
    <svg
      viewBox="0 0 280 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${currentSize.icon} shrink-0 drop-shadow-sm select-none transition-transform duration-300 group-hover:scale-105`}
    >
      {/* Dynamic Upper Green Fish Head */}
      <path
        d="M 148 46 C 180 32, 222 36, 238 48 C 220 70, 178 72, 150 56 Z"
        fill="#00D222"
        stroke="#000000"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Eye dot */}
      <circle cx="206" cy="48" r="4.5" fill="#000000" />

      {/* Main Red Dynamic Fish Body Wave */}
      <path
        d="M 104 68 
           L 110 57 
           C 142 56, 192 68, 238 58 
           C 220 86, 172 96, 126 94 
           C 82 108, 64 148, 60 188 
           C 54 150, 72 102, 104 68 Z"
        fill="#E81818"
        stroke="#000000"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Lower Green Belly / Wave Accent */}
      <path
        d="M 94 96 
           C 144 94, 186 98, 206 82 
           C 188 120, 116 122, 94 96 Z"
        fill="#00D222"
        stroke="#000000"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Left Tail Upward Green Fin */}
      <path
        d="M 28 66 
           C 52 82, 68 96, 70 108 
           C 54 94, 38 82, 28 66 Z"
        fill="#00D222"
        stroke="#000000"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* BFF Stamp Badge */}
      <circle
        cx="78"
        cy="74"
        r="14"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <text
        x="78"
        y="78"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fontFamily="sans-serif"
        fill="#000000"
        letterSpacing="-0.5"
      >
        BFF
      </text>
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoMark}</div>;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className} select-none`}>
        {LogoMark}
        <div className="mt-1 flex flex-col items-center">
          {/* Bonles Calligraphy Wordmark */}
          <span
            className={`font-serif italic font-bold tracking-tight ${
              lightBg ? 'text-black' : 'text-white'
            } ${currentSize.text} leading-none`}
            style={{ fontFamily: "'Playfair Display', Georgia, cursive" }}
          >
            Bonlés
          </span>
          {/* FOOD with Smiling Arc */}
          <div className="relative mt-0.5">
            <span
              className={`font-sans tracking-[0.25em] font-extrabold uppercase ${
                lightBg ? 'text-zinc-800' : 'text-zinc-300'
              } ${currentSize.sub}`}
            >
              FOOD
            </span>
            <svg
              viewBox="0 0 40 10"
              className="w-5 h-1.5 mx-auto -mt-0.5 text-current"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M 8 2 Q 20 9 32 2" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Default: Horizontal Brand Lockup
  return (
    <div className={`inline-flex items-center gap-3 ${className} select-none`}>
      {LogoMark}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-serif italic font-bold tracking-tight ${
              lightBg ? 'text-black' : 'text-white'
            } ${currentSize.text} leading-none`}
            style={{ fontFamily: "'Playfair Display', Georgia, cursive" }}
          >
            Bonlés
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[#E81818] font-black">
            FOOD
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#C5A059] font-bold">
            PT. Bonles Food Nusantara
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D222]" />
        </div>
      </div>
    </div>
  );
};
