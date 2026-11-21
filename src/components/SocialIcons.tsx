import React from 'react';

// Instagram Official Icon
export function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <img
      src="/instagram-clean.png"
      alt="اینستاگرام"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

// Telegram Official Icon
export function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <img
      src="/telegram-clean.png"
      alt="تلگرام"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

// WhatsApp Official Icon
export function WhatsappIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <img
      src="/whatsapp-clean.png"
      alt="واتساپ"
      className={`${className} object-contain inline-block shrink-0`}
    />
  );
}

// Bale (Iranian messenger)
export function BaleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-6" />
    </svg>
  );
}

// Rubika (Official Iranian Super-App Logo)
export function RubikaIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L20.5 7V17L12 22L3.5 17V7L12 2Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Central cube wireframe */}
      <path
        d="M12 7L16.5 9.5V14.5L12 17L7.5 14.5V9.5L12 7Z"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M12 12V17M12 12L16.5 9.5M12 12L7.5 9.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
