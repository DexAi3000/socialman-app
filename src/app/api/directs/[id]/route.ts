import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callGapGpt } from '@/lib/gapgpt';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const direct = await prisma.customerDirect.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!direct) {
      return NextResponse.json({ error: 'مکالمه یافت نشد.' }, { status: 404 });
    }

    // Mark unread as 0 when viewed
    if (direct.unreadCount > 0) {
      await prisma.customerDirect.update({
        where: { id },
        data: { unreadCount: 0 },
      });
    }

    return NextResponse.json({
      success: true,
      direct,
    });
  } catch (error: any) {
    console.error('Error fetching direct:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (typeof body.isAiEnabled === 'boolean') {
      dataToUpdate.isAiEnabled = body.isAiEnabled;
    }
    if (typeof body.unreadCount === 'number') {
      dataToUpdate.unreadCount = body.unreadCount;
    }

    const updated = await prisma.customerDirect.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, direct: updated });
  } catch (error: any) {
    console.error('Error updating direct:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { text, sender = 'admin', senderName = 'مدیر پیج', settings } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'متن پیام الزامی است.' }, { status: 400 });
    }

    const direct = await prisma.customerDirect.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 6,
        },
      },
    });

    if (!direct) {
      return NextResponse.json({ error: 'مکالمه یافت نشد.' }, { status: 404 });
    }

    // Create the message
    const newMessage = await prisma.directChatMessage.create({
      data: {
        directId: id,
        sender,
        senderName,
        text: text.trim(),
      },
    });

    // Update conversation lastMessage
    await prisma.customerDirect.update({
      where: { id },
      data: {
        lastMessage: text.trim(),
        lastMessageAt: new Date(),
        unreadCount: sender === 'customer' ? direct.unreadCount + 1 : 0,
      },
    });

    // If sender is 'customer' and AI auto-reply is enabled, generate AI response!
    let aiMessage = null;
    if (sender === 'customer' && direct.isAiEnabled) {
      try {
        const platformNames: Record<string, string> = {
          telegram: 'کانال/ربات تلگرام',
          instagram: 'دایرکت اینستاگرام',
          whatsapp: 'واتساپ',
          rubika: 'روبیکا و روبینو',
          bale: 'پیام‌رسان بله',
        };

        const recentHistory = [...direct.messages]
          .reverse()
          .map((m) => `${m.sender === 'customer' ? 'مشتری' : 'پشتیبان/هوش مصنوعی'}: ${m.text}`)
          .join('\n');

        const toneDescriptions: Record<string, string> = {
          friendly: 'بسیار صمیمی، پرانرژی، مهربان و با استفاده از ایموجی‌های شاد و محترمانه 🌸',
          formal: 'بسیار محترمانه، رسمی، اداری، بدون شوخی و شیک 💼',
          sales: 'فروشنده حرفه‌ای، ترغیب‌کننده مشتری به نهایی کردن خرید، معرفی تخفیف‌ها و پیشنهاد جذاب 🛍️',
          fast: 'بسیار کوتاه، مختصر، سریع و بدون اضافه گویی ⚡',
        };

        const chosenTone = toneDescriptions[settings?.aiTone] || toneDescriptions.friendly;
        const bName = settings?.businessName?.trim() || 'فروشگاه ما';
        const kb = settings?.knowledgeBase?.trim() || 'تمامی اجناس دارای ضمانت بازگشت و ارسال سریع هستند.';
        const ship = settings?.shippingInfo?.trim() ? `نحوه و زمان ارسال: ${settings.shippingInfo}` : '';
        const disc = settings?.discountCode?.trim() ? `کد تخفیف ویژه مشتریان: ${settings.discountCode}` : '';
        const phone = settings?.supportPhone?.trim() ? `تلفن پشتیبانی اضطراری در صورت درخواست مشتری: ${settings.supportPhone}` : '';
        const customRule = settings?.customInstructions?.trim() ? `دستورالعمل ویژه مدیر: ${settings.customInstructions}` : '';

        const systemPrompt = `تو پاسخگوی خودکار و دستیار فروش و پشتیبانی مشتریان برای "${bName}" در ${platformNames[direct.platform] || direct.platform} هستی.
نام مشتری طرف گفتگو: ${direct.customerName}.
لحن پاسخگویی تو: ${chosenTone}.

اطلاعات و راهنمای فروشگاه:
- ${kb}
${ship ? `- ${ship}` : ''}
${disc ? `- ${disc}` : ''}
${phone ? `- ${phone}` : ''}
${customRule ? `- ${customRule}` : ''}

قوانین پاسخگویی:
۱. کوتاه، دقیق و به زبان فارسی محاوره‌ای و روان چت کن (حداکثر ۲ تا ۳ جمله).
۲. دقیقاً بر اساس اطلاعات بالا به مشتری پاسخ بده.
۳. اگر مشتری چیزی خواست که در اطلاعات بالا نبود، با احترام بگو که به همکاران پشتیبان اطلاع می‌دهی تا بررسی کنند.`;

        const userPrompt = `تاریخچه مکالمه اخیر:
${recentHistory}

پیام جدید مشتری (${direct.customerName}): "${text.trim()}"
لطفاً پاسخ مناسب بنویس:`;

        const aiResponseText = await callGapGpt({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        });

        if (aiResponseText && aiResponseText.trim()) {
          aiMessage = await prisma.directChatMessage.create({
            data: {
              directId: id,
              sender: 'ai',
              senderName: 'پاسخگوی هوش مصنوعی سوشال‌من',
              text: aiResponseText.trim(),
            },
          });

          await prisma.customerDirect.update({
            where: { id },
            data: {
              lastMessage: aiResponseText.trim(),
              lastMessageAt: new Date(),
              unreadCount: 0,
            },
          });
        }
      } catch (aiErr) {
        console.error('GapGPT direct auto-reply error:', aiErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: newMessage,
      aiMessage,
    });
  } catch (error: any) {
    console.error('Error posting message:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
