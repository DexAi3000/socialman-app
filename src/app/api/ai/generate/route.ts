import { NextResponse } from 'next/server';
import { AiGenerationParams, AiGenerationResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body: AiGenerationParams = await request.json();
    const { topic, platform, tone, keywords } = body;

    if (!topic) {
      return NextResponse.json({ error: 'موضوع پست الزامی است.' }, { status: 400 });
    }

    const platformLabels: Record<string, string> = {
      instagram: 'اینستاگرام (ریلز و اسلایدی)',
      telegram: 'کانال تلگرام',
      whatsapp: 'کانال و برودکست واتساپ',
      bale: 'پیام‌رسان بله (کانال تجاری)',
      rubika: 'سوپراپلیکیشن روبیکا و روبینو',
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `تو کارشناس ارشد تولید محتوا و شبکه‌های اجتماعی در ایران هستی.
یک پست فوق‌العاده متناسب با پلتفرم "${platformLabels[platform] || platform}" و با لحن "${tone}" بنویس.
موضوع: ${topic}
کلمات کلیدی: ${keywords || 'ندارد'}

نکات اختصاصی پلتفرم:
- برای تلگرام و واتساپ از ساختار بولت‌پوینت، ایموجی‌های مناسب و فرمت‌بندی خوانا استفاده کن.
- برای اینستاگرام و روبیکا هوک توقف‌کننده، متن جذاب و هشتگ‌های ترند قرار بده.
- برای بله لحن تعاملی و کاربردی انتخاب کن.

پاسخ را دقیقاً در قالب JSON زیر برگردان:
{
  "hook": "جمله اول توقف‌کننده کاربر",
  "content": "متن بدنه اصلی پست همراه با ایموجی",
  "cta": "کال تو اکشن و دعوت به اقدام",
  "hashtags": ["هشتگ۱", "هشتگ۲", "هشتگ۳", "هشتگ۴"],
  "suggestedBestTime": "ساعت طلایی پیشنهادی"
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return NextResponse.json(JSON.parse(rawText));
          }
        }
      } catch (geminiError) {
        console.error('Gemini error, fallback to smart engine:', geminiError);
      }
    }

    return NextResponse.json(generateSmartFallback(topic, platform, tone, keywords));
  } catch (error) {
    console.error('Error generating AI post:', error);
    return NextResponse.json({ error: 'خطایی رخ داد' }, { status: 500 });
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
