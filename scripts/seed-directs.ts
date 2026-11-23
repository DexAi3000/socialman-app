import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true } });
  if (users.length === 0) return;

  const count = await prisma.customerDirect.count();
  if (count > 0) {
    console.log(`Already have ${count} directs, skipping seed.`);
    return;
  }

  const sampleDirects = [
    {
      platform: 'telegram',
      customerName: 'علیرضا رادمنش',
      customerHandle: '@alireza_rad',
      customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
      lastMessage: 'سلام، کاتالوگ قیمت پاییزه رو برام می‌فرستید؟',
      isAiEnabled: true,
      unreadCount: 1,
      messages: [
        { sender: 'customer', senderName: 'علیرضا رادمنش', text: 'سلام و وقت بخیر، محصولات جدیدتون تخفیف دارند؟' },
        { sender: 'ai', senderName: 'پاسخگوی هوش مصنوعی سوشال‌من', text: 'سلام علیرضا عزیز 🌸 وقت شما هم بخیر. بله! تمامی محصولات بخش جدید تا پایان هفته شامل ۲۰٪ تخفیف ویژه همراه با ارسال رایگان هستند.' },
        { sender: 'customer', senderName: 'علیرضا رادمنش', text: 'سلام، کاتالوگ قیمت پاییزه رو برام می‌فرستید؟' },
      ],
    },
    {
      platform: 'instagram',
      customerName: 'مریم احمدی',
      customerHandle: '@maryam_style99',
      customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
      lastMessage: 'فوق‌العاده بود، هزینه ارسال به شیراز چقدر میشه؟',
      isAiEnabled: true,
      unreadCount: 0,
      messages: [
        { sender: 'customer', senderName: 'مریم احمدی', text: 'سلام این روسری ابریشمی که استوری کردید موجوده هنوز؟' },
        { sender: 'ai', senderName: 'پاسخگوی هوش مصنوعی سوشال‌من', text: 'سلام مریم عزیز ✨ بله رنگ‌های زرشکی، طوسی و کرم هم‌اکنون در انبار آماده ارسال هستند. سایز قواره ۱۴۰ و جنس اعلا می‌باشد.' },
        { sender: 'customer', senderName: 'مریم احمدی', text: 'فوق‌العاده بود، هزینه ارسال به شیراز چقدر میشه؟' },
        { sender: 'ai', senderName: 'پاسخگوی هوش مصنوعی سوشال‌من', text: 'ارسال با پست پیشتاز برای سفارش‌های بالای ۴۰۰ هزار تومان کاملاً رایگان است و ظرف ۲ الی ۳ روز کاری به شیراز می‌رسد 🚚' },
      ],
    },
    {
      platform: 'rubika',
      customerName: 'فروشگاه تابان',
      customerHandle: '@taban_store',
      customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop',
      lastMessage: 'خرید عمده هم امکان‌پذیر هست؟',
      isAiEnabled: true,
      unreadCount: 1,
      messages: [
        { sender: 'customer', senderName: 'فروشگاه تابان', text: 'سلام وقتتون بخیر، همکار هستیم در روبینو.' },
        { sender: 'ai', senderName: 'پاسخگوی هوش مصنوعی سوشال‌من', text: 'سلام و احترام همکار گرامی 🤝 خوشحالیم از پیامتون. چطور می‌تونیم در خدمتتون باشیم؟' },
        { sender: 'customer', senderName: 'فروشگاه تابان', text: 'خرید عمده هم امکان‌پذیر هست؟' },
      ],
    },
    {
      platform: 'bale',
      customerName: 'مهندس حسینی',
      customerHandle: '@hoseini_it',
      customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
      lastMessage: 'ممنون، لینک پرداخت بله رو محبت می‌کنید؟',
      isAiEnabled: true,
      unreadCount: 0,
      messages: [
        { sender: 'customer', senderName: 'مهندس حسینی', text: 'سلام، تسویه فاکتور از طریق درگاه بله انجام میشه؟' },
        { sender: 'ai', senderName: 'پاسخگوی هوش مصنوعی سوشال‌من', text: 'سلام مهندس حسینی بزرگوار 🌿 بله فاکتورها مستقیماً با درگاه امن پرداخت بله یا شماره کارت سازمانی قابل پرداخت هستند.' },
        { sender: 'customer', senderName: 'مهندس حسینی', text: 'ممنون، لینک پرداخت بله رو محبت می‌کنید؟' },
        { sender: 'admin', senderName: 'نیما (مدیر پیج)', text: 'خدمت شما ارسال شد جناب حسینی، کد پیگیری ۵۵۲۹۱ ثبت گردید.' },
      ],
    },
    {
      platform: 'whatsapp',
      customerName: 'سارا کاظمی',
      customerHandle: '+989128889900',
      customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop',
      lastMessage: 'سلام، آدرس شوروم حضوری کجاست؟',
      isAiEnabled: true,
      unreadCount: 1,
      messages: [
        { sender: 'customer', senderName: 'سارا کاظمی', text: 'سلام روزتون بخیر 🌸' },
        { sender: 'ai', senderName: 'پاسخگوی هوش مصنوعی سوشال‌من', text: 'سلام سارا خانم عزیز 💖 روز شما هم بخیر و شادی! در خدمتتون هستیم.' },
        { sender: 'customer', senderName: 'سارا کاظمی', text: 'سلام، آدرس شوروم حضوری کجاست؟' },
      ],
    },
  ];

  for (const user of users) {
    for (const d of sampleDirects) {
      const created = await prisma.customerDirect.create({
        data: {
          userId: user.id,
          platform: d.platform,
          customerName: d.customerName,
          customerHandle: d.customerHandle,
          customerAvatar: d.customerAvatar,
          lastMessage: d.lastMessage,
          isAiEnabled: d.isAiEnabled,
          unreadCount: d.unreadCount,
          messages: {
            create: d.messages.map((m) => ({
              sender: m.sender,
              senderName: m.senderName,
              text: m.text,
            })),
          },
        },
      });
      console.log(`Created direct for ${d.customerName} (${d.platform})`);
    }
  }

  console.log('Seeded sample directs successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
