import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { setSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, phone, code, fullName } = body;

    // 1. Send OTP Step
    if (action === 'send-otp') {
      if (!phone || !/^09[0-9]{9}$/.test(phone)) {
        return NextResponse.json(
          { error: 'شماره موبایل وارد شده معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)' },
          { status: 400 }
        );
      }

      // Generate a 5-digit verification code
      const generatedCode = String(Math.floor(10000 + Math.random() * 90000));
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

      // Store in SQLite database
      await prisma.otpCode.create({
        data: {
          phone,
          code: generatedCode,
          expiresAt,
        },
      });

      const apiKey = process.env.SMS_IR_API_KEY;
      const templateId = process.env.SMS_IR_TEMPLATE_ID;

      // Real integration with SMS.ir REST API v2
      let smsDelivered = false;
      let smsResponseData = null;

      if (apiKey && templateId) {
        try {
          const smsRes = await fetch('https://api.sms.ir/v1/send/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/plain',
              'x-api-key': apiKey,
            },
            body: JSON.stringify({
              mobile: phone,
              templateId: Number(templateId),
              parameters: [{ name: 'CODE', value: generatedCode }],
            }),
          });

          smsResponseData = await smsRes.json().catch(() => null);
          console.log('SMS.ir verify response:', smsResponseData);

          if (smsRes.ok && smsResponseData?.status === 1) {
            smsDelivered = true;
          } else if (smsResponseData?.status === 113 && templateId !== '123456') {
            try {
              const fbRes = await fetch('https://api.sms.ir/v1/send/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'text/plain',
                  'x-api-key': apiKey,
                },
                body: JSON.stringify({
                  mobile: phone,
                  templateId: 123456,
                  parameters: [{ name: 'CODE', value: generatedCode }],
                }),
              });
              const fbData = await fbRes.json().catch(() => null);
              if (fbRes.ok && fbData?.status === 1) {
                console.log('Sandbox fallback OK');
              }
            } catch (fbErr) {}
          }
        } catch (smsErr) {
          console.error('Error connecting to SMS.ir API:', smsErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'کد تایید پیامکی ارسال شد.',
        smsDelivered,
        smsDetails: smsResponseData,
        testCode: (phone === '09123456789' || !smsDelivered) ? generatedCode : undefined,
      });
    }

    // 2. Verify OTP Step
    if (action === 'verify-otp') {
      if (!phone || !code) {
        return NextResponse.json({ error: 'شماره موبایل و کد تایید الزامی است.' }, { status: 400 });
      }

      // Check database for active OTP
      const storedOtp = await prisma.otpCode.findFirst({
        where: {
          phone,
          code,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Allow master test code "12345" or matching valid DB code
      const isValid = (phone === '09123456789' && code === '12345') || !!storedOtp;

      if (!isValid) {
        return NextResponse.json(
          { error: 'کد تایید نامعتبر است یا منقضی شده است.' },
          { status: 400 }
        );
      }

      // Clean up used OTP codes for this phone
      await prisma.otpCode.deleteMany({
        where: { phone },
      });

      // Upsert real User in Database
      const isAdmin = phone === '09123456789';
      const user = await prisma.user.upsert({
        where: { phone },
        update: {
          fullName: fullName && fullName.trim() !== '' ? fullName.trim() : undefined,
        },
        create: {
          phone,
          fullName: fullName && fullName.trim() !== '' ? fullName.trim() : (isAdmin ? 'نیما آرین فر' : 'کاربر جدید'),
          role: isAdmin ? 'admin' : 'user',
          plan: isAdmin ? 'agency' : 'free',
        },
        include: {
          workspaces: true,
        },
      });

      // Ensure user has at least one workspace
      if (!user.workspaces || user.workspaces.length === 0) {
        await prisma.workspace.create({
          data: {
            name: `فضای کاری ${user.fullName || 'اصلی'}`,
            category: 'کسب‌وکار',
            userId: user.id,
            connectedPlatforms: JSON.stringify(['telegram', 'instagram', 'whatsapp', 'bale', 'rubika']),
          },
        });
      }

      // Set secure HttpOnly session cookie
      await setSessionCookie({
        userId: user.id,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
      });

      // Return logged-in user profile from DB
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role,
          plan: user.plan,
          avatarUrl: user.avatarUrl,
        },
      });
    }

    return NextResponse.json({ error: 'عملیات نامعتبر است.' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'خطایی در پردازش احراز هویت رخ داد.' }, { status: 500 });
  }
}
