import type { PaidPlan, PlanType, SubscriptionPeriod } from '@/types';

export const DAY_MS = 24 * 60 * 60 * 1000;
export const SUBSCRIPTION_DAYS = 30;
export const EXPIRY_REMINDER_DAYS = 3;

export const paidPlanNames: Record<PaidPlan, string> = {
  pro: 'نقره‌ای',
  agency: 'طلایی',
};

interface PlanDates {
  plan: string;
  planStartedAt: Date | null;
  planExpiresAt: Date | null;
}

export function isPaidPlan(plan: string): plan is PaidPlan {
  return plan === 'pro' || plan === 'agency';
}

export function getEffectivePlan(user: Pick<PlanDates, 'plan' | 'planExpiresAt'>, now = new Date()): PlanType {
  if (!isPaidPlan(user.plan) || (user.planExpiresAt && user.planExpiresAt <= now)) return 'free';
  return user.plan;
}

export function getSubscriptionPeriod(user: PlanDates): SubscriptionPeriod | null {
  if (!isPaidPlan(user.plan)) return null;
  return {
    plan: user.plan,
    startedAt: user.planStartedAt?.toISOString() ?? null,
    expiresAt: user.planExpiresAt?.toISOString() ?? null,
  };
}

export function getPlanActivation(user: PlanDates, plan: PlanType, now = new Date()): PlanDates {
  if (plan === 'free') return { plan, planStartedAt: null, planExpiresAt: null };
  // Repeating the same approval during an active period must not extend it.
  if (user.plan === plan && user.planExpiresAt && user.planExpiresAt > now) {
    return { plan, planStartedAt: user.planStartedAt, planExpiresAt: user.planExpiresAt };
  }
  return { plan, planStartedAt: now, planExpiresAt: new Date(now.getTime() + SUBSCRIPTION_DAYS * DAY_MS) };
}

export function daysRemaining(expiresAt: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / DAY_MS));
}

const dateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  timeZone: 'Asia/Tehran',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatSubscriptionDate(date: string) {
  return dateFormatter.format(new Date(date));
}
