import React from 'react';

type SocialIconProps = {
  className?: string;
  decorative?: boolean;
};

type ImageIconProps = SocialIconProps & {
  src: string;
  label: string;
};

function ImageIcon({ src, label, className = 'w-4 h-4', decorative = false }: ImageIconProps) {
  return (
    <img
      src={src}
      alt={decorative ? '' : label}
      aria-hidden={decorative || undefined}
      draggable={false}
      className={`${className} inline-block shrink-0 object-contain select-none`}
    />
  );
}

export function InstagramIcon({ className, decorative }: SocialIconProps) {
  return (
    <ImageIcon
      src="/socialman/instagram-clean.png"
      label="اینستاگرام"
      className={className}
      decorative={decorative}
    />
  );
}

export function TelegramIcon({ className, decorative }: SocialIconProps) {
  return (
    <ImageIcon
      src="/socialman/telegram-clean.png"
      label="تلگرام"
      className={className}
      decorative={decorative}
    />
  );
}

export function WhatsappIcon({ className, decorative }: SocialIconProps) {
  return (
    <ImageIcon
      src="/socialman/whatsapp-clean.png"
      label="واتساپ"
      className={className}
      decorative={decorative}
    />
  );
}

export function BaleIcon({ className, decorative }: SocialIconProps) {
  return (
    <ImageIcon
      src="/socialman/bale-mark.svg"
      label="بله"
      className={className}
      decorative={decorative}
    />
  );
}

/** Vector Rubika mark without the watermark/background of the old bitmap. */
export function RubikaIcon({ className = 'w-4 h-4', decorative = false }: SocialIconProps) {
  return (
    <svg
      className={`${className} inline-block shrink-0`}
      viewBox="0 0 80 80"
      fill="none"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'روبیکا'}
      aria-hidden={decorative || undefined}
    >
      <path d="M40 5 70.3 22.5v35L40 75 9.7 57.5v-35L40 5Z" fill="#fff" />
      <path d="M40 5 25 13.7 40 22.4 55 13.7 40 5Z" fill="#8DC63F" />
      <path d="m55 13.7 15.3 8.8L55 31.3 40 22.4l15-8.7Z" fill="#00AEEF" />
      <path d="m70.3 22.5v17.6L55 31.3v-17.6l15.3 8.8Z" fill="#7048A5" />
      <path d="m70.3 40.1v17.4L55 48.7V31.3l15.3 8.8Z" fill="#5A2C91" />
      <path d="m70.3 57.5-15.3 8.8-15-8.7 15-8.9 15.3 8.8Z" fill="#F15A24" />
      <path d="M55 48.7v17.6L40 75V57.6l15-8.9Z" fill="#F7941D" />
      <path d="M40 57.6V75l-15-8.7V48.7l15 8.9Z" fill="#00A79D" />
      <path d="M25 48.7v17.6L9.7 57.5V40.1L25 48.7Z" fill="#0072BC" />
      <path d="M25 31.3v17.4L9.7 40.1V22.5L25 31.3Z" fill="#2E3192" />
      <path d="m25 13.7 15 8.7-15 8.9-15.3-8.8L25 13.7Z" fill="#EC008C" />
      <path d="m40 22.4 15 8.9-15 8.8-15-8.8 15-8.9Z" fill="#fff" />
      <path d="M25 31.3 40 40v17.6l-15-8.9V31.3Z" fill="#F1F5F9" />
      <path d="m40 40 15-8.7v17.4l-15 8.9V40Z" fill="#DDE3EA" />
    </svg>
  );
}
