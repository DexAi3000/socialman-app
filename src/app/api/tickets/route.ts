import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all tickets
export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'خطایی در دریافت تیکت‌ها رخ داد' }, { status: 500 });
  }
}

// POST create ticket or add reply
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ticketId, subject, department, priority, message, senderName } = body;

    // Add reply to existing ticket
    if (action === 'reply' && ticketId && message) {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const reply = await prisma.ticketMessage.create({
        data: {
          ticketId,
          sender: 'user',
          senderName: senderName || 'کاربر',
          message,
          timestamp: timeStr,
        },
      });

      // Update ticket status
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { updatedAt: new Date() },
      });

      return NextResponse.json({ success: true, message: reply });
    }

    // Create new ticket
    if (subject && department && message) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const trackingCode = `TK-${randomNum}`;
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const ticket = await prisma.ticket.create({
        data: {
          trackingCode,
          subject,
          department: department || 'technical',
          priority: priority || 'medium',
          status: 'open',
          createdAtShamsi: `امروز - ${timeStr}`,
          messages: {
            create: [
              {
                sender: 'user',
                senderName: senderName || 'نیما آرین فر',
                message,
                timestamp: timeStr,
              },
            ],
          },
        },
        include: {
          messages: true,
        },
      });

      return NextResponse.json({ success: true, ticket });
    }

    return NextResponse.json({ error: 'اطلاعات ارسالی ناقص است' }, { status: 400 });
  } catch (error) {
    console.error('Error in ticket operation:', error);
    return NextResponse.json({ error: 'خطایی در ثبت تیکت رخ داد' }, { status: 500 });
  }
}
