import { NextResponse } from 'next/server';
import { AiGenerationParams, AiGenerationResponse } from '@/types';
import { callGapGpt, getModelForPlan } from '@/lib/gapgpt';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { getEffectivePlan } from '@/lib/subscription';

export async function POST(request: Request) {
  try {
    const body: AiGenerationParams = await request.json();
    const { topic, platform, tone, keywords } = body;

    if (!topic) {
      return NextResponse.json({ error: 'موضوع پست الزامی است.' }, { status: 400 });
    }

    // Determine current user plan
    let userPlan = 'free';
    try {
      const session = await getSession();
      if (session?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          select: { plan: true, planExpiresAt: true },
        });
        if (user?.plan) {
          userPlan = getEffectivePlan(user);
        }
      }
    } catch (e) {
      // Ignore session errors and proceed with default
    }

    const platformLabels: Record<string, string> = {
      instagram: 'اینستاگرام (ریلز، اسلایدی و استوری)',
      telegram: 'کانال تلگرام با فرمت‌بندی رسمی و بولت‌پوینت',
      whatsapp: 'کانال و گروه‌های واتساپ',
      bale: 'پیام‌رسان بله (کانال‌های فروشگاهی و تجاری)',
      rubika: 'سوپراپلیکیشن روبیکا و روبینو',
    };

    const toneDescriptions: Record<string, string> = {
      friendly: 'دوستانه، صمیمی، پرانرژی و جذاب',
      formal: 'رسمی، حرفه‌ای، محترمانه و معتبر',
      persuasive: 'فروشگاهی و ترغیب‌کننده با قدرت اقناع بالا',
      educational: 'آموزشی، گام‌به‌گام و دارای ارزش افزوده بالا',
    };

    const targetModel = getModelForPlan(userPlan);

    const systemPrompt = `تو یک کارشناس ارشد دیجیتال مارکتینگ و کپی‌رایتر فوق‌حرفه‌ای برای شبکه‌های اجتماعی در بازار ایران هستی.
وظیفه تو نوشتن یک پست کامل، ویروسی، جذاب و استاندارد متناسب با پلتفرم انتخابی است.
نکات مهم:
۱. برای اینستاگرام و روبیکا حتماً هوک اولیه شوکه‌کننده یا کنجکاوی‌برانگیز باشد.
۲. برای تلگرام و واتساپ ساختار شکیل با بولت‌پوینت‌های متنی و ایموجی‌های مرتبط داشته باشد.
۳. هشتگ‌ها بدون علامت # و دقیقاً هماهنگ با موضوع باشند.
۴. لحن محتوا باید کاملاً رعایت شود: "${toneDescriptions[tone] || tone}".
۵. پاسخ باید منحصراً و بدون هیچ متن اضافه‌ای، یک JSON معتبر با ساختار زیر باشد:
{
  "hook": "جمله اول توقف‌کننده کاربر",
  "content": "متن بدنه اصلی پست همراه با پاراگراف‌بندی و ایموجی‌های متناسب",
  "cta": "دعوت به اقدام پایانی (CTA) جذاب",
  "hashtags": ["هشتگ۱", "هشتگ۲", "هشتگ۳", "هشتگ۴"],
  "suggestedBestTime": "ساعت طلایی پیشنهادی بر اساس پیک حضور مخاطبان پلتفرم"
}`;

    const userPrompt = `پلتفرم: ${platformLabels[platform] || platform}
موضوع پست: ${topic}
کلمات کلیدی مدنظر: ${keywords || 'ندارد'}
لحن درخواستی: ${toneDescriptions[tone] || tone}
پلن اشتراک کاربر: ${userPlan} (سطح پردازش: ${userPlan === 'agency' ? 'ویژه طلایی / حداکثر عمق خلاقیت' : 'استاندارد'})`;

    try {
      const rawAiResponse = await callGapGpt({
        model: targetModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: userPlan === 'agency' ? 0.8 : 0.7,
        response_format: { type: 'json_object' },
      });

      if (rawAiResponse) {
        const cleaned = rawAiResponse.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(cleaned);
        if (parsed.hook && parsed.content) {
          return NextResponse.json(parsed);
        }
      }
    } catch (gapGptErr) {
      console.error('GapGPT execution error, falling back to smart engine:', gapGptErr);
    }

    // High quality intelligent fallback if API is unreachable
    return NextResponse.json(generateSmartFallback(topic, platform, tone, keywords));
  } catch (error) {
    console.error('Error generating AI post:', error);
    return NextResponse.json({ error: 'خطایی در پردازش رخ داد' }, { status: 500 });
  }
}

function generateSmartFallback(
  topic: string,
  platform: string,
  tone: string,
  keywords?: string
): AiGenerationResponse {
  const bestTimes: Record<string, string> = {
    instagram: '۱۹:۳۰ عصر (پیک اکسپلور)',
    telegram: '۲۱:۰۰ شب (زمان فراغت شبانه)',
    whatsapp: '۱۱:۳۰ صبح و ۱۷:۰۰ عصر',
    bale: '۱۳:۳۰ بعدازظهر',
    rubika: '۲۰:۳۰ شب (زمان اوج روبینو)',
  };

  const hookTemplates: Record<string, string[]> = {
    instagram: [
      `چرا ۹۰٪ افراد درباره «${topic}» اشتباه می‌کنند؟ 🤫`,
      `راز مهمی درباره «${topic}» که نباید از دست بدی! 💡`,
    ],
    telegram: [
      `📌 خلاصه نکات کاربردی درباره «${topic}» در ۶۰ ثانیه:`,
      `⚡ خبر مهم و راهنمای تخصصی «${topic}»`,
    ],
    whatsapp: [
      `📢 *اطلاعیه مهم:* جدیدترین نکات درباره ${topic}`,
      `✨ پیشنهاد ویژه امروز درباره ${topic}`,
    ],
    bale: [
      `✅ راهنمای گام‌به‌گام و کاربردی ${topic}`,
      `🔔 چند نکته که کسب‌وکار شما درباره ${topic} باید بداند:`,
    ],
    rubika: [
      `ویژه روبینو: همه‌چیز درباره «${topic}» به زبان ساده! 🌟`,
      `این پست رو لایک و سیو کن تا درباره «${topic}» حرفه‌ای بشی 👇`,
    ],
  };

  const hooks = hookTemplates[platform] || hookTemplates.instagram;
  const chosenHook = hooks[Math.floor(Math.random() * hooks.length)];

  let content = '';
  if (platform === 'whatsapp') {
    content = `سلام و احترام به همراهان گرامی 🌸\n\nامروز می‌خواهیم ۳ اصل کلیدی درباره *${topic}* را بررسی کنیم:\n\n۱. *هدف‌گذاری دقیق:* بدون استراتژی پیش نروید.\n۲. *کیفیت اجرا:* مخاطب کیفیت را تشخیص می‌دهد.\n۳. *پیگیری مداوم:* نتایج در استمرار به دست می‌آید.`;
  } else if (platform === 'telegram') {
    content = `🔹 مهم‌ترین عوامل موفقیت در حوزه ${topic}:\n\n▪️ انتخاب مسیر درست و پرهیز از آزمون و خطای تکراری\n▪️ به‌کارگیری ابزارهای هوش مصنوعی برای افزایش سرعت\n▪️ تمرکز روی ارزش‌آفرینی واقعی برای مشتریان\n\n📊 فایل کامل این آموزش در کانال قرار گرفت.`;
  } else if (platform === 'bale') {
    content = `سلام به همه اعضای محترم کانال 🌿\n\nدرباره موضوع «${topic}» نکات زیر را به خاطر داشته باشید:\n- قبل از شروع، چک‌لیست اقدامات را آماده کنید.\n- از پشتیبانی و ارتباط سریع با مشتریان غافل نشوید.\n\nهمراه ما باشید تا نسخه تکمیلی را دریافت کنید.`;
  } else if (platform === 'rubika') {
    content = `سلام بچه‌ها! 😍\nاگه شما هم درگیر موضوع «${topic}» هستید، این ۳ نکته نجات‌دهنده رو از دست ندید:\n\n۱️⃣ همیشه نیاز مشتری رو بسنجید.\n۲️⃣ محتوای جذاب و با انرژی تولید کنید.\n۳️⃣ نظرات و کامنت‌ها رو با اشتیاق جواب بدید.\n\nاین پست رو برای دوستات هم بفرست!`;
  } else {
    content = `وقتی صحبت از «${topic}» میشه، خیلی‌ها راه رو اشتباه میرن!\nاما اگه این ۳ مرحله رو پیاده کنی، رشد پیجت قطعیه:\n\n✨ ۱. تو ۳ ثانیه اول قلاب بنداز\n✨ ۲. محتوای واقعی و کاربردی بده\n✨ ۳. در آخر بهشون بگو چیکار کنن\n\nسیو کردن این پست واجبه!`;
  }

  const ctaList: Record<string, string> = {
    instagram: 'تو کامنت‌ها بنویس نظرت چیه تا با هم گفتگو کنیم 👇',
    telegram: '🔗 برای عضویت در کانال وی‌آی‌پی روی لینک زیر کلیک کنید:',
    whatsapp: 'برای ثبت سفارش یا مشاوره رایگان همین الان پیام دهید 💬',
    bale: 'نظر یا سوال خود را با شناسه پشتیبانی کانال مطرح کنید ✉️',
    rubika: 'لایک کن و برام کامنت بذار تا آموزش بعدی رو برات بذارم ❤️',
  };

  const baseTags = ['مارکتینگ', 'کسب_و_کار', 'تولید_محتوا', 'ایران'];
  const customTags = keywords ? keywords.split(/[,،\s]+/).filter(Boolean) : [];
  const allTags = Array.from(new Set([...customTags, ...baseTags])).slice(0, 4);

  return {
    hook: chosenHook,
    content,
    cta: ctaList[platform] || 'حتماً با ما در ارتباط باشید',
    hashtags: allTags.map(t => t.replace(/^#/, '')),
    suggestedBestTime: bestTimes[platform] || '۱۹:۰۰ عصر',
  };
}
