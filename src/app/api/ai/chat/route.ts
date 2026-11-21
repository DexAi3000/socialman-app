import { NextResponse } from 'next/server';
import { callGapGpt, getModelForPlan } from '@/lib/gapgpt';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'پیام الزامی است' }, { status: 400 });
    }

    // Determine current user plan & name
    let userPlan = 'free';
    let userName = 'کاربر گرامی';
    try {
      const session = await getSession();
      if (session?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { plan: true, fullName: true },
        });
        if (user?.plan) userPlan = user.plan;
        if (user?.fullName) userName = user.fullName;
      }
    } catch (e) {
      // Ignore session errors
    }

    const targetModel = getModelForPlan(userPlan);

    const systemPrompt = `تو دستیار هوشمند، حرفه‌ای و ۲۴ ساعته اپلیکیشن «سوشال من» (Social Man) هستی.
نام کاربر: ${userName}
پلن فعلی کاربر: ${userPlan === 'agency' ? 'طلایی / آژانس (دسترسی نامحدود و ویژه)' : userPlan === 'pro' ? 'حرفه‌ای / نقره‌ای' : 'رایگان / برنز'}

درباره سوشال من:
۱. سوشال من هاب متمرکز مدیریت، تولید محتوا و انتشار همزمان در ۵ پلتفرم (اینستاگرام، تلگرام، واتساپ، روبیکا، بله) در ایران است.
۲. اتصال پلتفرم‌ها:
   - تلگرام: اضافه کردن ربات @SocialManPublishBot به کانال با دسترسی ادمین.
   - بله: اضافه کردن بازوی @SocialManPublishBot (ble.ir/SocialManPublishBot) به کانال با دسترسی ارسال پیام ادمین.
   - روبیکا: ثبت توکن بات یا اتصال ایمن به کانال.
   - اینستاگرام: اتصال رسمی با Meta Graph API بدون نیاز به پسورد.
   - واتساپ: وب‌هوک و کلود API رسمی.
۳. عدم نیاز به فیلترشکن: سرورهای سوشال من ابری هستند، بنابراین زمان‌بندی و انتشار خودکار بدون نیاز به فیلترشکن کاربر انجام می‌شود.
۴. ویژگی‌ها:
   - تقویم محتوایی و زمان‌بندی هوشمند در تاریخ و ساعت دقیق شمسی.
   - استودیو هوش مصنوعی (تولید هوک، کپشن، هشتگ و ساعت طلایی برای ۵ پلتفرم).
   - پورتال کارفرما: ارسال لینک پیش‌نویس برای تایید آنلاین کارفرما قبل از انتشار.
۵. قوانین پاسخ‌دهی:
   - زبان فارسی روان، بسیار مؤدبانه، حرفه‌ای، دقیق و همراه با ایموجی‌های مناسب.
   - پاسخ‌ها خلاصه، راهبردی و مرحله‌بندی شده باشند.
   - اگر کاربر مشکلی دارد که نیاز به بررسی دیتابیس یا پشتیبان انسانی دارد، به او بگو از تب «ثبت و پیگیری تیکت» تیکت ارسال کند.`;

    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    // Append last 6 turns from history if provided
    if (Array.isArray(history)) {
      const recent = history.slice(-6);
      for (const h of recent) {
        if (h.role === 'user' || h.role === 'assistant') {
          messages.push({ role: h.role, content: h.content });
        }
      }
    }

    messages.push({ role: 'user', content: message.trim() });

    try {
      const reply = await callGapGpt({
        model: targetModel,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      if (reply) {
        return NextResponse.json({ success: true, reply });
      }
    } catch (gapGptErr) {
      console.error('GapGPT chatbot error:', gapGptErr);
    }

    // Dynamic smart answer fallback
    return NextResponse.json({
      success: true,
      reply: getSmartFallbackReply(message),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'خطایی در پاسخ هوش مصنوعی رخ داد' }, { status: 500 });
  }
}

function getSmartFallbackReply(text: string): string {
  const q = text.toLowerCase();
  if (q.includes('تلگرام') || q.includes('telegram')) {
    return `📌 **راهنمای اتصال کانال تلگرام:**\n۱. در تلگرام وارد کانال خود شده و به Administrators بروید.\n۲. ربات **@SocialManPublishBot** را ادمین کنید.\n۳. دسترسی ارسال پیام (Post Messages) بدهید.\n۴. در بخش اتصال اکانت‌ها آیدی کانال را ثبت نمایید.`;
  }
  if (q.includes('اینستاگرام') || q.includes('instagram')) {
    return `📷 **اتصال اینستاگرام:**\nپیج شما باید حرفه‌ای باشد و به صفحه فیس‌بوک متصل گردد. سپس از دکمه «اتصال با Meta» لاگین را تایید کنید. بدون نیاز به پسورد و کاملاً امن!`;
  }
  if (q.includes('بله') || q.includes('bale')) {
    return `🌿 **اتصال پیام‌رسان بله:**\nوارد کانال بله شوید، به بخش مدیران بروید و بازوی **@SocialManPublishBot** را با دسترسی ارسال پیام ادمین نمایید.`;
  }
  if (q.includes('فیلترشکن') || q.includes('vpn')) {
    return `🛡️ **بدون نیاز به فیلترشکن:**\nسرورهای ابری سوشال‌من در خارج از کشور مستقر هستند؛ بنابراین انتشار و زمان‌بندی در هر ۵ پلتفرم بدون روشن بودن فیلترشکن انجام می‌شود.`;
  }
  return `سلام و درود! 🌸 سوال شما دریافت شد.\nسوشال‌من دستیار هوشمند مدیریت و انتشار همزمان در ۵ پلتفرم (اینستاگرام، تلگرام، بله، روبیکا، واتساپ) است.\nچنانچه نیاز به پشتیبانی کارشناسی یا دسترسی‌های فنی دارید، می‌توانید از بخش «ثبت و پیگیری تیکت» تیکت رسمی ارسال نمایید.`;
}
