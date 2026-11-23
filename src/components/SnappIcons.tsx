import type { ComponentType } from 'react';
import { CalendarDays, ClipboardCheck, MessageSquare, Sparkles, Star } from 'lucide-react';
import {
  BaleIcon,
  InstagramIcon,
  RubikaIcon,
  TelegramIcon,
  WhatsappIcon,
} from './SocialIcons';

type IconProps = { className?: string };
type GlyphProps = IconProps & { strokeWidth?: number };

export function PublishGlyph({ className, strokeWidth = 1.8 }: GlyphProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
      <path d="M12 7.75v2M6.2 9.55l3.65 2.15m4.3 0 3.65-2.15M6.85 17.1l3-2.65m4.3 0 3 2.65" />
      <circle cx="12" cy="12.75" r="2.65" />
      <circle cx="12" cy="5.75" r="1.8" />
      <circle cx="4.5" cy="8.55" r="1.8" />
      <circle cx="19.5" cy="8.55" r="1.8" />
      <circle cx="5.35" cy="18.45" r="1.8" />
      <circle cx="18.65" cy="18.45" r="1.8" />
    </svg>
  );
}

function FeatureIcon({ icon: Icon, tone, className = 'size-12' }: IconProps & {
  icon: ComponentType<GlyphProps>;
  tone: string;
}) {
  return (
    <span aria-hidden="true" className={`${className} ${tone} inline-grid shrink-0 place-items-center rounded-[26%]`}>
      <Icon className="size-[54%]" strokeWidth={1.8} />
    </span>
  );
}

function BrandIcon({ icon: Icon, tone, glyphSize, className = 'size-12' }: IconProps & {
  icon: ComponentType<{ className?: string; decorative?: boolean }>;
  tone: string;
  glyphSize: string;
}) {
  return (
    <span aria-hidden="true" className={`${className} ${tone} inline-grid shrink-0 place-items-center rounded-[26%]`}>
      <Icon className={glyphSize} decorative />
    </span>
  );
}

export function SnappInstagramIcon(props: IconProps) {
  return <BrandIcon {...props} icon={InstagramIcon} tone="bg-rose-50" glyphSize="size-[72%]" />;
}

export function SnappTelegramIcon(props: IconProps) {
  return <BrandIcon {...props} icon={TelegramIcon} tone="bg-sky-50" glyphSize="size-[54%]" />;
}

export function SnappWhatsappIcon(props: IconProps) {
  return <BrandIcon {...props} icon={WhatsappIcon} tone="bg-green-50" glyphSize="size-[62%]" />;
}

export function SnappRubikaIcon(props: IconProps) {
  return <BrandIcon {...props} icon={RubikaIcon} tone="bg-purple-50" glyphSize="size-[62%]" />;
}

export function SnappBaleIcon(props: IconProps) {
  return <BrandIcon {...props} icon={BaleIcon} tone="bg-teal-50" glyphSize="size-[54%]" />;
}

export function SnappPublishIcon(props: IconProps) {
  return <FeatureIcon {...props} icon={PublishGlyph} tone="bg-sky-100 text-sky-700" />;
}

export function SnappAiIcon(props: IconProps) {
  return <FeatureIcon {...props} icon={Sparkles} tone="bg-violet-50 text-violet-700" />;
}

export function SnappRecommendedIcon(props: IconProps) {
  return <FeatureIcon {...props} icon={Star} tone="bg-amber-50 text-amber-700" />;
}

export function SnappCalendarIcon(props: IconProps) {
  return <FeatureIcon {...props} icon={CalendarDays} tone="bg-amber-50 text-amber-700" />;
}

export function SnappApprovalIcon(props: IconProps) {
  return <FeatureIcon {...props} icon={ClipboardCheck} tone="bg-emerald-50 text-emerald-700" />;
}

export function SnappDirectsIcon(props: IconProps) {
  return <FeatureIcon {...props} icon={MessageSquare} tone="bg-indigo-50 text-indigo-700" />;
}
