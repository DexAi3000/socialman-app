"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PlanType,
  Post,
  Workspace,
  SocialPlatform,
  UserProfile,
  ConnectedAccountInfo,
  SupportTicket,
  TicketDepartment,
  TicketPriority,
  TicketMessage,
} from '@/types';

interface AppContextType {
  currentUser: UserProfile | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginUser: (user: Omit<UserProfile, 'isLoggedIn'>) => void;
  logoutUser: () => void;
  currentPlan: PlanType;
  aiUsageCount: number;
  maxAiUsage: number;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeWorkspace: Workspace;
  posts: Post[];
  tickets: SupportTicket[];
  addTicket: (
    subject: string,
    department: TicketDepartment,
    priority: TicketPriority,
    message: string
  ) => SupportTicket;
  addTicketReply: (ticketId: string, message: string) => void;
  isHamburgerMenuOpen: boolean;
  setIsHamburgerMenuOpen: (open: boolean) => void;
  connectedAccounts: Record<SocialPlatform, ConnectedAccountInfo>;
  isConnectModalOpen: boolean;
  targetPlatformForConnect: SocialPlatform | null;
  openConnectModal: (platform?: SocialPlatform) => void;
  closeConnectModal: () => void;
  toggleAccountConnection: (platform: SocialPlatform, handle?: string, name?: string) => void;
  isUpgradeModalOpen: boolean;
  selectedPlanForUpgrade: PlanType | null;
  setIsUpgradeModalOpen: (open: boolean) => void;
  openUpgradeModal: (targetPlan?: PlanType) => void;
  upgradePlan: (plan: PlanType) => void;
  setActiveWorkspaceId: (id: string) => void;
  addWorkspace: (name: string, category: string, platforms: SocialPlatform[]) => boolean;
  addPost: (postData: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  canUseAi: () => boolean;
  recordAiUsage: () => boolean;
  canAddWorkspace: () => boolean;
  updateUserAvatar: (avatarUrl?: string) => void;
}

const INITIAL_USER: UserProfile = {
  id: 'usr-8192',
  fullName: 'نیما آرین فر',
  phone: '۰۹۱۲۳۴۵۶۷۸۹',
  role: 'مدیر محتوا و ادمین',
  isLoggedIn: true,
  verifiedVia: 'SMS.ir',
};

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'آکادمی رشد و مارکتینگ',
    category: 'آموزش و کسب‌وکار',
    connectedPlatforms: ['instagram', 'telegram', 'whatsapp', 'bale', 'rubika'],
  },
  {
    id: 'ws-2',
    name: 'فروشگاه و برند چرم ماهان',
    category: 'پوشاک و لایف‌استایل',
    connectedPlatforms: ['instagram', 'rubika', 'bale'],
  },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    workspaceId: 'ws-1',
    title: '۵ ترفند افزایش تعامل استوری‌ها در پاییز',
    hook: 'چرا بازدید استوری‌هات زیر ۱۰ درصده؟ احتمالاً این ۲ تا اشتباه رو انجام میدی!',
    content: 'در الگوریتم جدید اینستاگرام، پاسخ به استیکرهای تعاملی ۵ برابر بیشتر از صرفاً دیدن اسلاید ارزش دارد. هر روز از نظرسنجی دوراهی استفاده کنید.',
    cta: 'تو کامنت‌ها بنویس میانگین ویو استوریت چقدره تا کمکت کنم!',
    hashtags: ['الگوریتم_اینستاگرام', 'افزایش_تعامل', 'تولید_محتوا', 'سوشال_مدیا'],
    platform: 'instagram',
    status: 'approved',
    scheduledDateShamsi: '۱۴۰۳/۰۹/۰۳',
    scheduledTime: '۱۸:۳۰',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post-2',
    workspaceId: 'ws-1',
    title: 'خلاصه اخبار هوش مصنوعی هفته در کانال تلگرام',
    hook: '⚡ مهم‌ترین رویدادهای دنیای تکنولوژی و AI در هفته‌ای که گذشت:',
    content: '۱. معرفی ابزارهای نوین ادیت ویدیو\n۲. بهبود سرعت مدل‌های پردازش زبان طبیعی\n۳. انتشار تمپلیت‌های رایگان طراحی محتوا',
    cta: 'عضو کانال وی‌آی‌پی ما بشید 👆',
    hashtags: ['هوش_مصنوعی', 'اخبار_فناوری', 'تلگرام'],
    platform: 'telegram',
    status: 'approved',
    scheduledDateShamsi: '۱۴۰۳/۰۹/۰۵',
    scheduledTime: '۲۱:۰۰',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post-3',
    workspaceId: 'ws-1',
    title: 'اطلاعیه برودکست تخفیف ویژه مشتریان واتساپ',
    hook: '📢 *پیشنهاد ویژه ۴۸ ساعته فقط برای همراهان واتساپ*',
    content: 'همراهان عزیز، از امروز می‌توانید با ارسال کد تخفیف اختصاصی در چت، از ۳۰٪ تخفیف روی تمامی خدمات بهره‌مند شوید.',
    cta: 'جهت فعال‌سازی کد تخفیف عدد ۱ را ریپلای کنید 💬',
    hashtags: ['تخفیف', 'واتساپ', 'باشگاه_مشتریان'],
    platform: 'whatsapp',
    status: 'pending_approval',
    scheduledDateShamsi: '۱۴۰۳/۰۹/۰۸',
    scheduledTime: '۱۶:۰۰',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post-4',
    workspaceId: 'ws-1',
    title: 'پست روبینو: چطور با گوشی عکس‌های فروشگاهی بگیریم؟',
    hook: 'عکاسی حرفه‌ای با موبایل بدون تجهیزات گرون قیمت! 📸',
    content: 'فقط کافیه نور طبیعی پنجره رو مهار کنی و لنز گوشیت رو قبل از عکاسی تمیز کنی! نتیجه باورنکردنی میشه.',
    cta: 'لایک کن و برام بنویس مدل گوشیت چیه تا تنظیمات دوربینشو بهت بگم ❤️',
    hashtags: ['عکاسی_با_موبایل', 'روبیکا', 'روبینو', 'ترفند'],
    platform: 'rubika',
    status: 'approved',
    scheduledDateShamsi: '۱۴۰۳/۰۹/۱۰',
    scheduledTime: '۲۰:۳۰',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'post-5',
    workspaceId: 'ws-1',
    title: 'اطلاعیه رسمی کانال بله: وبینار رایگان بازاریابی محتوا',
    hook: '🌿 وبینار آموزشی رایگان با اعطای گواهی معتبر',
    content: 'ثبت‌نام دوره ویژه تولید محتوا با هوش مصنوعی در پیام‌رسان بله آغاز شد. برای کسب اطلاعات بیشتر همراه ما باشید.',
    cta: 'برای ثبت نام از طریق بات بله اقدام فرمایید ✉️',
    hashtags: ['پیام_رسان_بله', 'آموزش_رایگان', 'وبینار'],
    platform: 'bale',
    status: 'draft',
    scheduledDateShamsi: '۱۴۰۳/۰۹/۱۲',
    scheduledTime: '۱۴:۰۰',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_CONNECTED_ACCOUNTS: Record<SocialPlatform, ConnectedAccountInfo> = {
  instagram: {
    platform: 'instagram',
    isConnected: true,
    accountName: 'آکادمی رشد و مارکتینگ',
    handle: '@growth_academy_ir',
    connectedAt: '۱۴۰۳/۰۸/۱۵',
  },
  telegram: {
    platform: 'telegram',
    isConnected: true,
    accountName: 'ربات انتشار تلگرام SocialMan',
    handle: '@SocialManPublishBot',
    botUsername: '@SocialManPublishBot',
    botToken: '9115798954:AAHHygpdWUJlhI3k-FX7rtU2egGt7wwHwrg',
    connectedAt: 'متصل به Bot API تلگرام ✓',
  },
  whatsapp: {
    platform: 'whatsapp',
    isConnected: true,
    accountName: 'پشتیبانی و برودکست آکادمی',
    handle: '+989123456789',
    connectedAt: '۱۴۰۳/۰۸/۱۶',
  },
  rubika: {
    platform: 'rubika',
    isConnected: true,
    accountName: 'ربات انتشار روبیکا SocialMan',
    handle: '@SocialManPublishBot',
    botUsername: '@SocialManPublishBot',
    botToken: 'CJIJEG0ICJPDQSHEUWTHRWIDFFITRQUHWBZFEAQAYUJHCUZUGSYBGUQXCUZHERIR',
    connectedAt: 'متصل به پلتفرم بات روبیکا ✓',
  },
  bale: {
    platform: 'bale',
    isConnected: true,
    accountName: 'بازوی رسمی بله SocialMan',
    handle: 'ble.ir/SocialManPublishBot',
    botUsername: '@SocialManPublishBot',
    botToken: '369114062:R7BeEnjLaDSiFv26-wsP-4ol_aGbTKmBNo',
    connectedAt: 'متصل به بازوی بله ✓',
  },
};

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'ticket-1',
    trackingCode: 'TK-84920',
    subject: 'راهنمایی در اتصال ربات تلگرام به کانال رسمی',
    department: 'channels',
    priority: 'high',
    status: 'answered',
    createdAtShamsi: '۱۴۰۳/۰۸/۲۸ - ۱۰:۱۵',
    updatedAtShamsi: '۱۴۰۳/۰۸/۲۸ - ۱۰:۲۵',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'نیما آرین فر',
        message: 'سلام وقت بخیر، ربات SocialManPublishBot رو در کانال تلگرام ادمین کردم ولی توی اپ ارور دسترسی میداد، می‌خواستم بدونم چه دسترسی‌هایی نیازه؟',
        timestamp: '۱۰:۱۵',
      },
      {
        id: 'msg-2',
        sender: 'support',
        senderName: 'پشتیبانی فنی سوشال‌من',
        message: 'درود بر شما نیما عزیز. برای ارسال موفق پست‌ها در تلگرام، تنها دسترسی «Post Messages (ارسال پیام و مدیا)» برای ربات کافی است. دسترسی‌های دیگر مانند تغییر اطلاعات کانال نیاز نیست. اتصال پیج شما هم‌اکنون با موفقیت تایید و تست شد.',
        timestamp: '۱۰:۲۵',
      },
    ],
  },
  {
    id: 'ticket-2',
    trackingCode: 'TK-83411',
    subject: 'درخواست فعال‌سازی فاکتور رسمی مالی برای اشتراک',
    department: 'billing',
    priority: 'medium',
    status: 'in_progress',
    createdAtShamsi: '۱۴۰۳/۰۸/۲۵ - ۱۶:۴۰',
    updatedAtShamsi: '۱۴۰۳/۰۸/۲۵ - ۱۷:۰۰',
    messages: [
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
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(INITIAL_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [aiUsageCount, setAiUsageCount] = useState<number>(3);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-1');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  const [connectedAccounts, setConnectedAccounts] =
    useState<Record<SocialPlatform, ConnectedAccountInfo>>(INITIAL_CONNECTED_ACCOUNTS);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [targetPlatformForConnect, setTargetPlatformForConnect] = useState<SocialPlatform | null>(null);

  // Sync initial data from real database on mount
  useEffect(() => {
    // 1. Fetch Workspaces from DB
    fetch('/api/workspaces')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.workspaces?.length > 0) {
          setWorkspaces(d.workspaces);
          setActiveWorkspaceId(d.workspaces[0].id);
        }
      })
      .catch((err) => console.log('Workspaces DB sync:', err));

    // 2. Fetch Posts from DB
    fetch('/api/posts')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.posts?.length > 0) {
          setPosts(d.posts);
        }
      })
      .catch((err) => console.log('Posts DB sync:', err));

    // 3. Fetch Tickets from DB
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.tickets?.length > 0) {
          setTickets(d.tickets);
        }
      })
      .catch((err) => console.log('Tickets DB sync:', err));
  }, []);

  const openConnectModal = (platform?: SocialPlatform) => {
    setTargetPlatformForConnect(platform || null);
    setIsConnectModalOpen(true);
  };

  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
    setTargetPlatformForConnect(null);
  };

  const toggleAccountConnection = (platform: SocialPlatform, handle?: string, name?: string) => {
    setConnectedAccounts((prev) => {
      const current = prev[platform];
      const nextState = !current.isConnected;
      return {
        ...prev,
        [platform]: {
          ...current,
          isConnected: nextState,
          handle: handle || current.handle,
          accountName: name || current.accountName,
          connectedAt: nextState ? 'امروز' : undefined,
        },
      };
    });
  };

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanType | null>(null);

  const maxAiUsage = currentPlan === 'free' ? 10 : Infinity;
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginUser = (userData: Omit<UserProfile, 'isLoggedIn'>) => {
    setCurrentUser({
      ...userData,
      isLoggedIn: true,
    });
    setIsAuthModalOpen(false);
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUserAvatar = (avatarUrl?: string) => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        avatarUrl,
      });
    }
  };

  const canUseAi = () => {
    return currentPlan === 'agency';
  };

  const recordAiUsage = () => {
    if (currentPlan !== 'agency') {
      openUpgradeModal('agency');
      return false;
    }
    setAiUsageCount((prev) => prev + 1);
    return true;
  };

  const canAddWorkspace = () => {
    if (currentPlan === 'free' && workspaces.length >= 1) return false;
    if (currentPlan === 'pro' && workspaces.length >= 5) return false;
    return true;
  };

  const addWorkspace = (name: string, category: string, platforms: SocialPlatform[]) => {
    if (!canAddWorkspace()) {
      openUpgradeModal(currentPlan === 'free' ? 'pro' : 'agency');
      return false;
    }
    const tempId = `ws-${Date.now()}`;
    const newWs: Workspace = {
      id: tempId,
      name,
      category,
      connectedPlatforms: platforms,
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(tempId);

    // Persist to real database
    fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, connectedPlatforms: platforms }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.workspace) {
          setWorkspaces((prev) => prev.map((w) => (w.id === tempId ? d.workspace : w)));
          setActiveWorkspaceId(d.workspace.id);
        }
      })
      .catch((err) => console.error('Error saving workspace to DB:', err));

    return true;
  };

  const openUpgradeModal = (targetPlan?: PlanType) => {
    setSelectedPlanForUpgrade(targetPlan || 'pro');
    setIsUpgradeModalOpen(true);
  };

  const upgradePlan = (plan: PlanType) => {
    setCurrentPlan(plan);
    setIsUpgradeModalOpen(false);
  };

  const addPost = (postData: Omit<Post, 'id' | 'createdAt'>) => {
    const tempId = `post-${Date.now()}`;
    const newPost: Post = {
      ...postData,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    setPosts((prev) => [newPost, ...prev]);

    // Persist to real database
    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.post) {
          setPosts((prev) => prev.map((p) => (p.id === tempId ? d.post : p)));
        }
      })
      .catch((err) => console.error('Error saving post to DB:', err));
  };

  const updatePost = (id: string, updates: Partial<Post>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    // Persist to real database
    fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    }).catch((err) => console.error('Error updating post in DB:', err));
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));

    // Persist to real database
    fetch(`/api/posts?id=${id}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting post in DB:', err));
  };

  const addTicket = (
    subject: string,
    department: TicketDepartment,
    priority: TicketPriority,
    message: string
  ): SupportTicket => {
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const tempId = `ticket-${Date.now()}`;
    const newTicket: SupportTicket = {
      id: tempId,
      trackingCode: `TK-${randomCode}`,
      subject,
      department,
      priority,
      status: 'open',
      createdAtShamsi: 'امروز - همین الان',
      updatedAtShamsi: 'امروز - همین الان',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: currentUser?.fullName || 'کاربر گرامی',
          message,
          timestamp: 'هم‌اکنون',
        },
      ],
    };
    setTickets((prev) => [newTicket, ...prev]);

    // Persist to real database
    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        department,
        priority,
        message,
        senderName: currentUser?.fullName,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.ticket) {
          setTickets((prev) => prev.map((t) => (t.id === tempId ? d.ticket : t)));
        }
      })
      .catch((err) => console.error('Error saving ticket to DB:', err));

    return newTicket;
  };

  const addTicketReply = (ticketId: string, message: string) => {
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: currentUser?.fullName || 'کاربر گرامی',
      message,
      timestamp: 'هم‌اکنون',
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'open',
          updatedAtShamsi: 'هم‌اکنون',
          messages: [...t.messages, newMsg],
        };
      })
    );

    // Persist reply to real database
    fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'reply',
        ticketId,
        message,
        senderName: currentUser?.fullName,
      }),
    }).catch((err) => console.error('Error saving reply to DB:', err));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginUser,
        logoutUser,
        currentPlan,
        aiUsageCount,
        maxAiUsage,
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        posts,
        tickets,
        addTicket,
        addTicketReply,
        isHamburgerMenuOpen,
        setIsHamburgerMenuOpen,
        connectedAccounts,
        isConnectModalOpen,
        targetPlatformForConnect,
        openConnectModal,
        closeConnectModal,
        toggleAccountConnection,
        isUpgradeModalOpen,
        selectedPlanForUpgrade,
        setIsUpgradeModalOpen,
        openUpgradeModal,
        upgradePlan,
        setActiveWorkspaceId,
        addWorkspace,
        addPost,
        updatePost,
        deletePost,
        canUseAi,
        recordAiUsage,
        canAddWorkspace,
        updateUserAvatar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
