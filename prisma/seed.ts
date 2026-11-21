import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Initial User
  const user = await prisma.user.upsert({
    where: { phone: '09123456789' },
    update: {},
    create: {
      id: 'usr-8192',
      phone: '09123456789',
      fullName: 'نیما آرین فر',
      role: 'admin',
      plan: 'pro',
    },
  });
  console.log('✅ User seeded:', user.fullName);

  // 2. Create Initial Workspaces
  const ws1 = await prisma.workspace.upsert({
    where: { id: 'ws-1' },
    update: {},
    create: {
      id: 'ws-1',
      name: 'آکادمی رشد و مارکتینگ',
      category: 'آموزش و کسب‌وکار',
      connectedPlatforms: JSON.stringify(['instagram', 'telegram', 'whatsapp', 'bale', 'rubika']),
      userId: user.id,
    },
  });

  const ws2 = await prisma.workspace.upsert({
    where: { id: 'ws-2' },
    update: {},
    create: {
      id: 'ws-2',
      name: 'فروشگاه و برند چرم ماهان',
      category: 'پوشاک و لایف‌استایل',
      connectedPlatforms: JSON.stringify(['instagram', 'rubika', 'bale']),
      userId: user.id,
    },
  });
  console.log('✅ Workspaces seeded: ws-1, ws-2');

  // 3. Create Initial Posts
  const postsCount = await prisma.post.count();
  if (postsCount === 0) {
    await prisma.post.createMany({
      data: [
        {
          id: 'post-1',
          workspaceId: ws1.id,
          title: '۵ ترفند افزایش تعامل استوری‌ها در پاییز',
          hook: 'چرا بازدید استوری‌هات زیر ۱۰ درصده؟ احتمالاً این ۲ تا اشتباه رو انجام میدی!',
          content: 'در الگوریتم جدید اینستاگرام، پاسخ به استیکرهای تعاملی ۵ برابر بیشتر از صرفاً دیدن اسلاید ارزش دارد. هر روز از نظرسنجی دوراهی استفاده کنید.',
          cta: 'تو کامنت‌ها بنویس میانگین ویو استوریت چقدره تا کمکت کنم!',
          hashtags: JSON.stringify(['الگوریتم_اینستاگرام', 'افزایش_تعامل', 'تولید_محتوا', 'سوشال_مدیا']),
          platform: 'instagram',
          status: 'approved',
          scheduledDateShamsi: '۱۴۰۳/۰۹/۰۳',
          scheduledTime: '۱۸:۳۰',
          userId: user.id,
        },
        {
          id: 'post-2',
          workspaceId: ws1.id,
          title: 'خلاصه اخبار هوش مصنوعی هفته در کانال تلگرام',
          hook: '⚡ مهم‌ترین رویدادهای دنیای تکنولوژی و AI در هفته‌ای که گذشت:',
          content: '۱. معرفی ابزارهای نوین ادیت ویدیو\n۲. بهبود سرعت مدل‌های پردازش زبان طبیعی\n۳. انتشار تمپلیت‌های رایگان طراحی محتوا',
          cta: 'عضو کانال وی‌آی‌پی ما بشید 👆',
          hashtags: JSON.stringify(['هوش_مصنوعی', 'اخبار_فناوری', 'تلگرام']),
          platform: 'telegram',
          status: 'approved',
          scheduledDateShamsi: '۱۴۰۳/۰۹/۰۵',
          scheduledTime: '۲۱:۰۰',
          userId: user.id,
        },
        {
          id: 'post-3',
          workspaceId: ws1.id,
          title: 'اطلاعیه برودکست تخفیف ویژه مشتریان واتساپ',
          hook: '📢 *پیشنهاد ویژه ۴۸ ساعته فقط برای همراهان واتساپ*',
          content: 'کد تخفیف اختصاصی ۳۰ درصدی برای سفارش‌های بالای ۱ میلیون تومان در سایت فعال شد.\nکد: AUTUMN30',
          cta: 'همین الان لینک سفارش رو لمس کنید',
          hashtags: JSON.stringify(['تخفیف', 'واتساپ', 'فروش_ویژه']),
          platform: 'whatsapp',
          status: 'approved',
          scheduledDateShamsi: '۱۴۰۳/۰۹/۰۶',
          scheduledTime: '۱۰:۰۰',
          userId: user.id,
        },
        {
          id: 'post-4',
          workspaceId: ws1.id,
          title: 'ویدیو آموزشی جدید در کانال بله و روبیکا',
          hook: '🎬 نحوه دریافت تیک آبی کانال‌های ایرانی در کمتر از ۱ هفته!',
          content: 'در این آموزش تمام مدارک لازم و مراحل ثبت درخواست در سامانه‌های مربوطه توضیح داده شده است.',
          cta: 'ویدیو کامل را در کانال مشاهده کنید',
          hashtags: JSON.stringify(['آموزش', 'روبیکا', 'بله']),
          platform: 'rubika',
          status: 'approved',
          scheduledDateShamsi: '۱۴۰۳/۰۹/۰۸',
          scheduledTime: '۱۹:۱۵',
          userId: user.id,
        },
        {
          id: 'post-5',
          workspaceId: ws1.id,
          title: 'معرفی کالکشن زمستانه چرم ماهان (پست در انتظار تایید)',
          hook: '❄️ استایل زمستانه خودت رو با دست‌دوزهای طبیعی خاص کن!',
          content: 'کت‌های چرم گاوی درجه یک با آستر ترمه، تولید محدود ویژه یلدا.',
          cta: 'برای ثبت پیش‌خرید دایرکت پیام دهید',
          hashtags: JSON.stringify(['کالکشن_زمستانه', 'چرم_طبیعی', 'پوشاک']),
          platform: 'instagram',
          status: 'pending_approval',
          scheduledDateShamsi: '۱۴۰۳/۰۹/۱۰',
          scheduledTime: '۲۰:۰۰',
          clientToken: 'token-preview-8812',
          userId: user.id,
        },
      ],
    });
    console.log('✅ Posts seeded');
  }

  // 4. Create Initial Tickets
  const ticketsCount = await prisma.ticket.count();
  if (ticketsCount === 0) {
    const t1 = await prisma.ticket.create({
      data: {
        id: 'ticket-1',
        trackingCode: 'TK-94201',
        subject: 'مشکل در همگام‌سازی توکن کانال روبیکا',
        department: 'technical',
        priority: 'high',
        status: 'open',
        createdAtShamsi: '۱۴۰۳/۰۸/۲۴ - ۱۱:۳۰',
        userId: user.id,
        messages: {
          create: [
            {
              id: 'msg-1',
              sender: 'user',
              senderName: 'نیما آرین فر',
              message: 'سلام، توکن بات روبیکا بعد از ارسال ۳ پست با ارور Timeout مواجه شد. لطفاً بررسی بفرمایید.',
              timestamp: '۱۱:۳۰',
            },
            {
              id: 'msg-2',
              sender: 'support',
              senderName: 'پشتیبانی فنی سوشال‌من',
              message: 'درود، تیکت شما دریافت شد. در حال بررسی وضعیت وب‌هوک و لاگ سرور روبیکا هستیم و نتیجه اعلام خواهد شد.',
              timestamp: '۱۱:۴۵',
            },
          ],
        },
      },
    });

    const t2 = await prisma.ticket.create({
      data: {
        id: 'ticket-2',
        trackingCode: 'TK-83411',
        subject: 'درخواست فعال‌سازی فاکتور رسمی مالی برای اشتراک',
        department: 'billing',
        priority: 'medium',
        status: 'in_progress',
        createdAtShamsi: '۱۴۰۳/۰۸/۲۵ - ۱۶:۴۰',
        userId: user.id,
        messages: {
          create: [
            {
              id: 'msg-3',
              sender: 'user',
              senderName: 'نیما آرین فر',
              message: 'با سلام، فاکتور خرید پلن برای حسابداری شرکت نیاز است، از کجا می‌توانم دانلود کنم؟',
              timestamp: '۱۶:۴۰',
            },
            {
              id: 'msg-4',
              sender: 'support',
              senderName: 'امور مالی سوشال‌من',
              message: 'سلام و احترام، اطلاعات حقوقی شما دریافت شد. فاکتور رسمی دارای شناسه ملی و کد رهگیری مالیاتی ظرف ۲۴ ساعت کاری صادر و ارسال می‌گردد.',
              timestamp: '۱۷:۰۰',
            },
          ],
        },
      },
    });
    console.log('✅ Tickets seeded');
  }

  // 5. Create Initial Social Accounts
  const accounts = [
    { platform: 'telegram', handle: '@SocialManPublishBot', accountName: 'ربات انتشار تلگرام', botToken: '9115798954:AAHHygpdWUJlhI3k-FX7rtU2egGt7wwHwrg', isConnected: true },
    { platform: 'rubika', handle: '@SocialManPublishBot', accountName: 'بات رسمی روبیکا', botToken: 'CJIJEG0ICJPDQSHEUWTHRWIDFFITRQUHWBZFEAQAYUJHCUZUGSYBGUQXCUZHERIR', isConnected: true },
    { platform: 'bale', handle: '@SocialManPublishBot', accountName: 'بازوی ارتباطی بله', botToken: '369114062:R7BeEnjLaDSiFv26-wsP-4ol_aGbTKmBNo', isConnected: true },
    { platform: 'instagram', handle: '@socialman.app', accountName: 'پیج اینستاگرام سوشال‌من', isConnected: true },
    { platform: 'whatsapp', handle: '+989123456789', accountName: 'واتساپ بیزینس', isConnected: true },
  ];

  for (const acc of accounts) {
    await prisma.socialAccount.upsert({
      where: { platform: acc.platform },
      update: {},
      create: {
        platform: acc.platform,
        handle: acc.handle,
        accountName: acc.accountName,
        botToken: acc.botToken,
        isConnected: acc.isConnected,
        connectedAt: 'امروز',
      },
    });
  }
  console.log('✅ Social Accounts seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
