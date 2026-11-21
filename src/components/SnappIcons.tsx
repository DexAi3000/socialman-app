import React from 'react';

// ============================================================================
// ULTRA-HIGH-FIDELITY 3D CLAYMORPHIC ICONS (Matching Snapp SuperApp 3D Style)
// Dimensional, vibrant, tactile, with specular highlights and soft drop shadows
// ============================================================================

// 1. Instagram Official High-Res Icon (User Provided)
export function SnappInstagramIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(225,48,108,0.25)] transition-transform hover:scale-105 duration-300 flex items-center justify-center`}>
      <img
        src="/instagram-clean.png"
        alt="اینستاگرام"
        className="w-full h-full object-contain pointer-events-none select-none"
      />
    </div>
  );
}

// 2. Telegram Official High-Res Icon (User Provided)
export function SnappTelegramIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(42,171,238,0.3)] transition-transform hover:scale-105 duration-300 flex items-center justify-center`}>
      <img
        src="/telegram-clean.png"
        alt="تلگرام"
        className="w-full h-full object-contain pointer-events-none select-none"
      />
    </div>
  );
}

// 3. WhatsApp Official High-Res Icon (User Provided)
export function SnappWhatsappIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(37,211,102,0.3)] transition-transform hover:scale-105 duration-300 flex items-center justify-center`}>
      <img
        src="/whatsapp-clean.png"
        alt="واتساپ"
        className="w-full h-full object-contain pointer-events-none select-none"
      />
    </div>
  );
}

// 4. Rubika Official 3D Multi-color Hexagon (Matching Image 4)
export function SnappRubikaIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(237,28,36,0.25)] transition-transform hover:scale-105 duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <clipPath id="rubikaHexClip">
            <path
              d="M40 7L69 23.8C71 25 72 27 72 29.5V60.5C72 63 71 65 69 66.2L40 83C38.5 83.8 36.5 83.8 35 83L6 66.2C4 65 3 63 3 60.5V29.5C3 27 4 25 6 23.8L35 7C36.5 6.2 38.5 6.2 40 7Z"
              transform="scale(0.88) translate(5, 4)"
            />
          </clipPath>
          <filter id="rubikaShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.2" />
          </filter>
        </defs>

        <g transform="translate(40, 40) scale(0.92) translate(-40, -40)" filter="url(#rubikaShadow)">
          {/* Outer Rounded Hexagon Background */}
          {/* Top Greens */}
          <polygon points="40,6 25.3,14.5 40,23" fill="#8dc63f" />
          <polygon points="40,6 40,23 54.7,14.5" fill="#72b027" />

          {/* Top-Right Cyans */}
          <polygon points="54.7,14.5 69.4,23 54.7,31.5" fill="#00aeef" />
          <polygon points="54.7,14.5 54.7,31.5 40,23" fill="#0096c7" />

          {/* Right Purples */}
          <polygon points="69.4,23 69.4,40 54.7,31.5" fill="#7b2cbf" />
          <polygon points="69.4,40 69.4,57 54.7,48.5" fill="#5a189a" />
          <polygon points="69.4,40 54.7,48.5 54.7,31.5" fill="#4a154b" />

          {/* Bottom-Right Reds & Oranges */}
          <polygon points="69.4,57 54.7,65.5 54.7,48.5" fill="#ed1c24" />
          <polygon points="54.7,65.5 40,74 40,57" fill="#f7931e" />
          <polygon points="54.7,65.5 40,57 54.7,48.5" fill="#ea580c" />

          {/* Bottom & Bottom-Left Lime & Teal */}
          <polygon points="40,74 25.3,65.5 40,57" fill="#8bc34a" />
          <polygon points="25.3,65.5 10.6,57 25.3,48.5" fill="#00a896" />
          <polygon points="25.3,65.5 25.3,48.5 40,57" fill="#028090" />

          {/* Left Blues */}
          <polygon points="10.6,57 10.6,40 25.3,48.5" fill="#0077b6" />
          <polygon points="10.6,40 10.6,23 25.3,31.5" fill="#2e3192" />
          <polygon points="10.6,40 25.3,31.5 25.3,48.5" fill="#1e206b" />

          {/* Top-Left Pinks & Magentas */}
          <polygon points="10.6,23 25.3,14.5 25.3,31.5" fill="#ec008c" />
          <polygon points="25.3,14.5 40,23 25.3,31.5" fill="#f15a24" />

          {/* Central 3D White/Gray Cube */}
          {/* Top Face */}
          <polygon points="40,23 54.7,31.5 40,40 25.3,31.5" fill="#ffffff" />
          {/* Left Face */}
          <polygon points="25.3,31.5 40,40 40,57 25.3,48.5" fill="#f1f5f9" />
          {/* Right Face */}
          <polygon points="40,40 54.7,31.5 54.7,48.5 40,57" fill="#e2e8f0" />
        </g>
      </svg>
    </div>
  );
}

// 5. Bale 3D Clay Teal/Emerald Financial Coin
export function SnappBaleIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(13,148,136,0.35)] transition-transform hover:scale-105 duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="baleBg" x1="12" y1="12" x2="68" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>
          <linearGradient id="baleRing" x1="20" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* 3D Coin Body */}
        <circle cx="40" cy="40" r="32" fill="url(#baleBg)" />
        {/* Glossy Rim */}
        <circle cx="40" cy="40" r="28" stroke="url(#baleRing)" strokeWidth="3" />
        <ellipse cx="40" cy="22" rx="20" ry="7" fill="#ffffff" fillOpacity="0.35" />

        {/* 3D Checkmark Emblem */}
        <path
          d="M26 41L35 50L54 31"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="53" cy="28" r="4" fill="#facc15" />
      </svg>
    </div>
  );
}

// 6. Gemini AI Studio 3D Iridescent Magic Wand & Spark
export function SnappAiIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(99,102,241,0.35)] transition-transform hover:scale-105 duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="aiBg" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="aiStar" x1="25" y1="25" x2="55" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
        </defs>

        <rect x="10" y="10" width="60" height="60" rx="20" fill="url(#aiBg)" />
        <ellipse cx="40" cy="22" rx="22" ry="8" fill="#ffffff" fillOpacity="0.3" />

        {/* Big 3D Star Sparkle */}
        <path
          d="M40 22C40 31.9 31.9 40 22 40C31.9 40 40 48.1 40 58C40 48.1 48.1 40 58 40C48.1 40 40 31.9 40 22Z"
          fill="url(#aiStar)"
        />
        {/* Little Floating Star */}
        <circle cx="56" cy="24" r="3" fill="#fef08a" />
        <circle cx="26" cy="54" r="2.5" fill="#ffffff" />
      </svg>
    </div>
  );
}

// 7. Shamsi Calendar 3D Isometric Flip Desk
export function SnappCalendarIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(245,158,11,0.35)] transition-transform hover:scale-105 duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="calBg" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Base Pad */}
        <rect x="10" y="12" width="60" height="58" rx="16" fill="url(#calBg)" />
        {/* Spiral Binder Rings */}
        <rect x="22" y="8" width="6" height="12" rx="3" fill="#ffffff" />
        <rect x="37" y="8" width="6" height="12" rx="3" fill="#ffffff" />
        <rect x="52" y="8" width="6" height="12" rx="3" fill="#ffffff" />

        {/* White Inner Sheet */}
        <rect x="16" y="24" width="48" height="40" rx="10" fill="#ffffff" />
        {/* Red Header Strip */}
        <path d="M16 24h48v10H16z" fill="#ef4444" rx="4" />

        {/* Date number: ۲۵ */}
        <text x="40" y="55" textAnchor="middle" fill="#1e293b" fontSize="18" fontWeight="900" fontFamily="sans-serif">
          ۲۵
        </text>
      </svg>
    </div>
  );
}

// 8. Client Approval 3D Clipboard & Green Seal
export function SnappApprovalIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(16,185,129,0.35)] transition-transform hover:scale-105 duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="appBg" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        <rect x="12" y="10" width="56" height="62" rx="16" fill="url(#appBg)" />
        <ellipse cx="40" cy="22" rx="20" ry="7" fill="#ffffff" fillOpacity="0.3" />

        {/* Document Sheet */}
        <rect x="20" y="22" width="40" height="42" rx="8" fill="#ffffff" />
        {/* Document lines */}
        <rect x="26" y="30" width="28" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="26" y="36" width="20" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="26" y="42" width="24" height="3" rx="1.5" fill="#cbd5e1" />

        {/* Green Wax Seal Badge */}
        <circle cx="48" cy="50" r="10" fill="#22c55e" />
        <path d="M44 50l3 3 6-6" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// 9. Pricing & Pro Subscription 3D Shiny Crown
export function SnappCrownIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(245,158,11,0.4)] transition-transform hover:scale-105 duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="crownBg" x1="10" y1="10" x2="70" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        <rect x="10" y="10" width="60" height="60" rx="20" fill="url(#crownBg)" />
        <ellipse cx="40" cy="22" rx="22" ry="8" fill="#ffffff" fillOpacity="0.35" />

        {/* 3D Crown Shape */}
        <path
          d="M22 52L24 30L34 40L40 26L46 40L56 30L58 52H22Z"
          fill="#ffffff"
        />
        {/* Crown Base Gemstones */}
        <circle cx="28" cy="48" r="2.5" fill="#ef4444" />
        <circle cx="40" cy="48" r="2.5" fill="#3b82f6" />
        <circle cx="52" cy="48" r="2.5" fill="#10b981" />
      </svg>
    </div>
  );
}

// 10. Snapp-style 3D Shopping Bag
export function SnappShopIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(168,85,247,0.35)] transition-transform hover:scale-105 duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="shopBg" x1="12" y1="12" x2="68" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </defs>

        <rect x="12" y="18" width="56" height="52" rx="16" fill="url(#shopBg)" />
        {/* Handles */}
        <path d="M28 22V14a12 12 0 0124 0v8" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="40" cy="28" rx="20" ry="7" fill="#ffffff" fillOpacity="0.3" />

        {/* Discount Badge */}
        <g transform="translate(30, 36)">
          <text x="10" y="16" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900">
            %
          </text>
        </g>
      </svg>
    </div>
  );
}

// 11. Snapp-style 3D Wallet / Credit Pay
export function SnappWalletIcon({ className = 'w-14 h-14' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 drop-shadow-[0_8px_16px_rgba(59,130,246,0.35)] transition-transform hover:scale-105 duration-300`}>
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="walBg" x1="12" y1="12" x2="68" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>

        {/* Credit Card Peeking Out */}
        <rect x="22" y="14" width="36" height="22" rx="4" fill="#fbbf24" />
        {/* Wallet Body */}
        <rect x="12" y="24" width="56" height="46" rx="14" fill="url(#walBg)" />
        {/* Wallet Flap & Clasp */}
        <path d="M50 42h18v14H50a7 7 0 01-7-7v0a7 7 0 017-7z" fill="#1e40af" />
        <circle cx="56" cy="49" r="3" fill="#facc15" />
        <ellipse cx="40" cy="32" rx="20" ry="6" fill="#ffffff" fillOpacity="0.3" />
      </svg>
    </div>
  );
}

// Standard flat fallbacks
export {
  InstagramIcon,
  TelegramIcon,
  WhatsappIcon,
  RubikaIcon,
  BaleIcon,
} from './SocialIcons';
