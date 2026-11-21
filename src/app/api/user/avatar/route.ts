import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'کاربر احراز هویت نشده است.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { avatarUrl } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: avatarUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: updatedUser.avatarUrl,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('Avatar update error:', error);
    return NextResponse.json({ error: 'خطایی در ذخیره تصویر پروفایل رخ داد.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'کاربر احراز هویت نشده است.' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: null },
    });

    return NextResponse.json({ success: true, message: 'تصویر پروفایل حذف شد.' });
  } catch (error: any) {
    console.error('Avatar delete error:', error);
    return NextResponse.json({ error: 'خطایی در حذف تصویر پروفایل رخ داد.' }, { status: 500 });
  }
}
