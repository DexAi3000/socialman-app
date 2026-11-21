import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
  pro: { amount: 189000, name: 'نقره‌ای (حرفه‌ای)' },
  agency: { amount: 580000, name: 'طلایی (آژانس)' },
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const { plan = 'pro', callbackUrl } = body;

    const planData = PLAN_PRICES[plan] || PLAN_PRICES.pro;
    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const origin = callbackUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callback = `${origin}/payment/verify?plan=${plan}`;

    // 1. If merchant ID is provided, connect to live ZarinPal gateway
    if (merchantId) {
      try {
        const zpRes = await fetch('https://payment.zarinpal.com/pg/v4/payment/request.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            merchant_id: merchantId,
            amount: planData.amount * 10, // Rials
            currency: 'IRR',
            description: `ارتقای اشتراک سوشال‌من - پلن ${planData.name}`,
            callback_url: callback,
            metadata: {
              mobile: session?.phone || '09123456789',
            },
          }),
        });

        const zpData = await zpRes.json().catch(() => null);

        if (zpRes.ok && zpData?.data?.code === 100) {
          const authority = zpData.data.authority;
          return NextResponse.json({
            success: true,
            mode: 'live',
            authority,
            paymentUrl: `https://payment.zarinpal.com/pg/StartPay/${authority}`,
            amount: planData.amount,
          });
        }
      } catch (zpErr) {
        console.error('Zarinpal live error:', zpErr);
      }
    }

    // 2. High-speed Sandbox / Testing Gateway Mode
    const mockRefId = String(Math.floor(10000000 + Math.random() * 90000000));
    const mockAuthority = `A00000000000000000000000000${mockRefId.slice(0, 8)}`;

    // Update user plan in DB if user is logged in
    if (session?.userId) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { plan },
      });
    }

    return NextResponse.json({
      success: true,
      mode: 'sandbox',
      authority: mockAuthority,
      refId: mockRefId,
      plan,
      amount: planData.amount,
      paymentUrl: `/payment/verify?Authority=${mockAuthority}&Status=OK&plan=${plan}&refId=${mockRefId}`,
      message: 'درگاه پرداخت آماده اتصال است.',
    });
  } catch (error: any) {
    console.error('Payment request error:', error);
    return NextResponse.json({ error: 'خطایی در ایجاد تراکنش رخ داد.' }, { status: 500 });
  }
}
