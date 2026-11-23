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
    const { text, sender = 'admin', senderName = 'مدیر پیج' } = body;

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

        const systemPrompt = `تو پاسخگوی خودکار و دستیار هوشمند فروشگاه و پیج ایرانی در شبکه اجتماعی ${platformNames[direct.platform] || direct.platform} هستی.
نام مشتری: ${direct.customerName}.
وظیفه تو این است که بسیار با ادب، صمیمی، پرانرژی و راهنما به سوال مشتری پاسخ بدهی.
اگر سوال درباره قیمت، موجودی یا خرید پرسید، با خوش‌رویی راهنمایی کن و از ایموجی‌های مناسب استفاده کن.
پاسخ باید کوتاه، جذاب، متناسب با چت و محاوره‌ای محترمانه باشد (حداکثر ۲ تا ۳ جمله).`;

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
