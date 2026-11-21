import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: 'با موفقیت خارج شدید.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'خطایی در خروج رخ داد.' }, { status: 500 });
  }
}
