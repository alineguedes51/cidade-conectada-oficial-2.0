import React from 'react';

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
}

export default function BrandLogo({
  className = 'h-11',
  showText = true,
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* SVG Emblem / Icon */}
      <svg
        viewBox="0 -25 200 225"
        className="h-full w-auto shrink-0 animate-fade-in"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cidade Conectada Logo"
      >
        {/* Yellow top half-circle stroke */}
        <path
          d="M 28,110 A 72,72 0 0,1 172,110"
          stroke="#FCD116"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* Green bottom half-circle stroke */}
        <path
          d="M 172,110 A 72,72 0 0,1 28,110"
          stroke="#008A27"
          strokeWidth="6.5"
          strokeLinecap="round"
        />

        {/* Nodes */}
        <circle
          cx="28"
          cy="110"
          r="10"
          fill="white"
          stroke="#008A27"
          strokeWidth="4.5"
        />
        <circle cx="28" cy="110" r="4" fill="#008A27" />

        <circle
          cx="172"
          cy="110"
          r="10"
          fill="white"
          stroke="#008A27"
          strokeWidth="4.5"
        />
        <circle cx="172" cy="110" r="4" fill="#008A27" />

        <circle
          cx="100"
          cy="182"
          r="10"
          fill="white"
          stroke="#008A27"
          strokeWidth="4.5"
        />
        <circle cx="100" cy="182" r="4" fill="#008A27" />

        {/* Clip */}
        <defs>
          <clipPath id="circle-clip">
            <circle cx="100" cy="110" r="69" />
          </clipPath>
        </defs>

        <g clipPath="url(#circle-clip)">
          {/* Background */}
          <rect x="20" y="30" width="160" height="150" fill="white" />

          {/* Igreja */}
          <path
            d="M 43,90 L 76,90 L 76,140 L 43,140 Z"
            fill="white"
            stroke="#008A27"
            strokeWidth="3"
          />

          <path
            d="M 43,90 L 59.5,70 L 76,90 Z"
            fill="white"
            stroke="#008A27"
            strokeWidth="3"
          />

          <path
            d="M 54,115 L 65,115 L 65,140 L 54,140 Z"
            fill="#008A27"
          />

          <rect
            x="48"
            y="96"
            width="6"
            height="11"
            rx="3"
            fill="#008A27"
          />

          <rect
            x="62"
            y="96"
            width="6"
            height="11"
            rx="3"
            fill="#008A27"
          />

          {/* Torre */}
          <path
            d="M 81,77 L 99,77 L 99,140 L 81,140 Z"
            fill="white"
            stroke="#008A27"
            strokeWidth="3"
          />

          <path
            d="M 81,77 L 90,65 L 99,77 Z"
            fill="white"
            stroke="#008A27"
            strokeWidth="3"
          />

          <rect
            x="87"
            y="86"
            width="6"
            height="13"
            rx="3"
            fill="#008A27"
          />

          {/* Construção amarela */}
          <path
            d="M 99,112 L 158,107 L 158,150 L 99,150 Z"
            fill="#FCD116"
            stroke="#008A27"
            strokeWidth="2.5"
          />

          <path
            d="M 96,112 L 160,107"
            stroke="#008A27"
            strokeWidth="3.5"
          />

          {/* Colinas */}
          <path
            d="M 23,125 Q 60,165 100,160 T 177,130 L 177,190 L 23,190 Z"
            fill="#008A27"
          />

          {/* Caminho */}
          <path
            d="M 45,190 Q 72,146 112,160 T 172,132"
            fill="none"
            stroke="white"
            strokeWidth="8.5"
            strokeLinecap="round"
          />
        </g>

        {/* Pin */}
        <g transform="translate(100, 48)">
          <path
            d="M 0,0 C -16,-16 -23,-25 -23,-41 C -23,-55 -12,-66 0,-66 C 12,-66 23,-55 23,-41 C 23,-25 16,-16 0,0 Z"
            fill="#008A27"
            stroke="white"
            strokeWidth="3"
          />

          <circle cx="0" cy="-41" r="7.5" fill="white" />
        </g>
      </svg>

      {/* TEXTO LIMPO */}
      {showText && (
        <div className="flex flex-col justify-center leading-none text-left select-none">
          <div className="flex flex-col -space-y-[3px]">
            <span className="text-base md:text-lg lg:text-xl font-black text-[#008A27] tracking-tight font-sans">
              cidade
            </span>

            <span className="text-base md:text-lg lg:text-xl font-black text-[#008A27] tracking-tight font-sans leading-none">
              conectada
            </span>
          </div>

          {/* Linha decorativa */}
          <div className="flex items-center w-full mt-1">
            <div className="h-[2.5px] w-[45%] bg-[#FCD116] rounded-l" />

            <div className="w-2 h-2 rounded-full border-[1.5px] border-[#008A27] bg-white shrink-0 mx-0.5" />

            <div className="h-[2.5px] w-[48%] bg-[#008A27] rounded-r" />
          </div>
        </div>
      )}
    </div>
  );
}