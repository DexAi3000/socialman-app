import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, identifier, plan } = body;

    const expectedSecret = process.env.ADMIN_BOT_SECRET || 'novexa_secret_99812_socialman';
    if (!secret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز (Secret اشتباه است)' }, { status: 403 });
    }

    if (!identifier || !plan) {
      return NextResponse.json({ error: 'شناسه کاربر و نام پلن الزامی است.' }, { status: 400 });
    }

    const targetPlan = String(plan).toLowerCase().trim();
    if (!['free', 'pro', 'agency'].includes(targetPlan)) {
      return NextResponse.json({ error: 'نام پلن نامعتبر است (free, pro, agency).' }, { status: 400 });
    }

    const cleanInput = String(identifier).trim();
    let cleanPhone = cleanInput.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      cleanPhone = '0' + cleanPhone;
    }

    // Search user by phone or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(cleanPhone ? [{ phone: cleanPhone }] : []),
          { username: cleanInput.toLowerCase() },
          { phone: cleanInput },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `کاربری با شماره یا نام‌کاربری «${cleanInput}» در پایگاه‌داده یافت نشد.` },
        { status: 404 }
      );
    }

    // Update user plan
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: targetPlan,
      },
    });

    return NextResponse.json({
      success: true,
      message: `پلن کاربر ${updatedUser.fullName || updatedUser.username || updatedUser.phone} با موفقیت به ${targetPlan} ارتقا یافت.`,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        username: updatedUser.username,
        phone: updatedUser.phone,
        plan: updatedUser.plan,
        role: updatedUser.role,
      },
    });
  } catch (error: any) {
    console.error('Upgrade API Error:', error);
    return NextResponse.json({ error: error.message || 'خطای سرور در ارتقای پلن' }, { status: 500 });
  }
}
