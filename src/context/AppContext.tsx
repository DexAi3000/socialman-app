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
import { normalizeTelegramChatId } from '@/lib/telegram-utils';

interface AppContextType {
  currentUser: UserProfile | null;
  isAuthChecked: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginUser: (user: Omit<UserProfile, 'isLoggedIn'>, token?: string) => void;
  logoutUser: () => void;
  refreshSession: () => void;
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
  toggleAccountConnection: (
    platform: SocialPlatform,
    handle?: string,
    name?: string,
    forceState?: boolean,
    botToken?: string
  ) => void;
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

const INITIAL_WORKSPACES: Workspace[] = [];

const INITIAL_POSTS: Post[] = [];

const INITIAL_CONNECTED_ACCOUNTS: Record<SocialPlatform, ConnectedAccountInfo> = {
  instagram: {
    platform: 'instagram',
    isConnected: false,
    accountName: 'پیج اینستاگرام',
    handle: '',
  },
  telegram: {
    platform: 'telegram',
    isConnected: false,
    accountName: 'کانال یا گروه تلگرام',
    handle: '',
    botUsername: '@SocialManPublishBot',
    botToken: '9115798954:AAHHygpdWUJlhI3k-FX7rtU2egGt7wwHwrg',
  },
  whatsapp: {
    platform: 'whatsapp',
    isConnected: false,
    accountName: 'شماره یا کانال واتساپ',
    handle: '',
  },
  rubika: {
    platform: 'rubika',
    isConnected: false,
    accountName: 'کانال یا ربات روبیکا',
    handle: '',
    botUsername: '@SocialManPublishBot',
    botToken: 'CJIJEG0ICJPDQSHEUWTHRWIDFFITRQUHWBZFEAQAYUJHCUZUGSYBGUQXCUZHERIR',
  },
  bale: {
    platform: 'bale',
    isConnected: false,
    accountName: 'کانال یا بازوی بله',
    handle: '',
    botUsername: '@SocialManPublishBot',
    botToken: '369114062:1NMlMxXeD9k-I4oEI7YcXvyVmYqIJ3h9LnI',
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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [aiUsageCount, setAiUsageCount] = useState<number>(3);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);

  const [connectedAccounts, setConnectedAccounts] =
    useState<Record<SocialPlatform, ConnectedAccountInfo>>(INITIAL_CONNECTED_ACCOUNTS);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [targetPlatformForConnect, setTargetPlatformForConnect] = useState<SocialPlatform | null>(null);

  // Session refresh helper that syncs user & plan from database
  const refreshSession = () => {
    const headers: Record<string, string> = {};
    try {
      const cached = localStorage.getItem('socialman_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.id) headers['x-user-id'] = parsed.id;
        if (parsed?.phone) headers['x-user-phone'] = parsed.phone;
      }
      const token = localStorage.getItem('socialman_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (_) {}

    fetch('/socialman/api/auth/me', {
      headers,
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          const profile: UserProfile = {
            id: d.user.id,
            fullName: d.user.fullName,
            phone: d.user.phone,
            username: d.user.username,
            role: d.user.role,
            plan: (d.user.plan || 'free') as PlanType,
            avatarUrl: d.user.avatarUrl,
            isLoggedIn: true,
          };
          setCurrentUser(profile);
          if (d.user.plan) {
            setCurrentPlan(d.user.plan as PlanType);
          }
          if (d.workspaces && d.workspaces.length > 0) {
            const formattedWs = d.workspaces.map((ws: any) => ({
              ...ws,
              connectedPlatforms:
                typeof ws.connectedPlatforms === 'string'
                  ? JSON.parse(ws.connectedPlatforms || '[]')
                  : ws.connectedPlatforms,
            }));
            setWorkspaces(formattedWs);
            setActiveWorkspaceId((prev) =>
              prev && formattedWs.some((w: any) => w.id === prev) ? prev : formattedWs[0].id
            );
          }
          if (d.connectedAccounts && typeof d.connectedAccounts === 'object') {
            if (d.connectedAccounts.bale?.botToken?.includes('R7BeEnjLaDSiFv26')) {
              d.connectedAccounts.bale.botToken = '369114062:1NMlMxXeD9k-I4oEI7YcXvyVmYqIJ3h9LnI';
            }
            setConnectedAccounts((prev) => ({ ...prev, ...d.connectedAccounts }));
            try {
              localStorage.setItem('socialman_connected_accounts', JSON.stringify(d.connectedAccounts));
            } catch (_) {}
          }

          try {
            localStorage.setItem('socialman_user', JSON.stringify(profile));
            if (d.token) {
              localStorage.setItem('socialman_token', d.token);
            }
          } catch (_) {}
        }

        // Fetch user accounts from database
        fetch('/socialman/api/user/accounts', {
          headers: getAuthHeaders(),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data?.success && data?.connectedAccounts && typeof data.connectedAccounts === 'object') {
              if (data.connectedAccounts.bale?.botToken?.includes('R7BeEnjLaDSiFv26')) {
                data.connectedAccounts.bale.botToken = '369114062:1NMlMxXeD9k-I4oEI7YcXvyVmYqIJ3h9LnI';
              }
              setConnectedAccounts((prev) => ({ ...prev, ...data.connectedAccounts }));
              try {
                localStorage.setItem('socialman_connected_accounts', JSON.stringify(data.connectedAccounts));
              } catch (_) {}
            }
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.log('Auth session check error:', err);
      })
      .finally(() => {
        setIsAuthChecked(true);
      });
  };

  // Helper to get auth headers from local cache
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    try {
      const cached = localStorage.getItem('socialman_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.id) headers['x-user-id'] = parsed.id;
        if (parsed?.phone) headers['x-user-phone'] = parsed.phone;
      }
      const token = localStorage.getItem('socialman_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (_) {}
    return headers;
  };

  // Sync initial data from real database and check session on mount
  useEffect(() => {
    // 0. Restore cached session immediately from localStorage for instant render
    try {
      const cached = localStorage.getItem('socialman_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.isLoggedIn) {
          setCurrentUser(parsed);
          if (parsed.plan) setCurrentPlan(parsed.plan as PlanType);
        }
      }
    } catch (_) {}

    // Restore cached connected channels from localStorage for instant initial render
    try {
      const cachedAccounts = localStorage.getItem('socialman_connected_accounts');
      if (cachedAccounts) {
        const parsed = JSON.parse(cachedAccounts);
        if (parsed && typeof parsed === 'object') {
          if (parsed.bale?.botToken?.includes('R7BeEnjLaDSiFv26')) {
            parsed.bale.botToken = '369114062:1NMlMxXeD9k-I4oEI7YcXvyVmYqIJ3h9LnI';
          }
          setConnectedAccounts((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (_) {}

    // Verify and refresh from real DB session
    refreshSession();

    // Re-check session whenever tab comes into focus or visibility changes
    window.addEventListener('focus', refreshSession);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodic live sync (every 6 seconds) so admin approval in Telegram instantly unlocks app
    const syncInterval = setInterval(refreshSession, 6000);

    // 1. Fetch Workspaces from DB for current user
    fetch('/socialman/api/workspaces', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.workspaces?.length > 0) {
          setWorkspaces(d.workspaces);
          setActiveWorkspaceId((prev) =>
            prev && d.workspaces.some((w: any) => w.id === prev) ? prev : d.workspaces[0].id
          );
        }
      })
      .catch((err) => console.log('Workspaces DB sync:', err));

    // 2. Fetch Tickets from DB
    fetch('/socialman/api/tickets', { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.tickets?.length > 0) {
          setTickets(d.tickets);
        }
      })
      .catch((err) => console.log('Tickets DB sync:', err));

    return () => {
      window.removeEventListener('focus', refreshSession);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(syncInterval);
    };
  }, []);

  // Fetch posts strictly scoped to the active workspace
  useEffect(() => {
    if (!activeWorkspaceId) {
      setPosts([]);
      return;
    }

    fetch(`/socialman/api/posts?workspaceId=${encodeURIComponent(activeWorkspaceId)}`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.posts)) {
          setPosts(d.posts);
        } else {
          setPosts([]);
        }
      })
      .catch((err) => {
        console.log('Posts DB sync:', err);
        setPosts([]);
      });
  }, [activeWorkspaceId]);

  const openConnectModal = (platform?: SocialPlatform) => {
    setTargetPlatformForConnect(platform || null);
    setIsConnectModalOpen(true);
  };

  const closeConnectModal = () => {
    setIsConnectModalOpen(false);
    setTargetPlatformForConnect(null);
  };

  const toggleAccountConnection = (
    platform: SocialPlatform,
    handle?: string,
    name?: string,
    forceState?: boolean,
    botToken?: string
  ) => {
    setConnectedAccounts((prev) => {
      const current = prev[platform];
      const nextState = forceState !== undefined ? forceState : (handle ? true : !current.isConnected);
      const cleanHandle = handle
        ? platform === 'telegram'
          ? normalizeTelegramChatId(handle)
          : handle.trim()
        : current.handle;

      const updated = {
        ...prev,
        [platform]: {
          ...current,
          isConnected: nextState,
          handle: nextState ? (cleanHandle || current.handle) : '',
          accountName: nextState ? (name || current.accountName) : current.accountName,
          connectedAt: nextState ? current.connectedAt || 'امروز' : undefined,
          botToken: nextState ? (botToken || current.botToken) : undefined,
        },
      };

      try {
        localStorage.setItem('socialman_connected_accounts', JSON.stringify(updated));
        localStorage.setItem('socialman_accounts_v3', 'true');
      } catch (_) {}

      // Persist to database immediately
      try {
        const headers = getAuthHeaders();
        headers['Content-Type'] = 'application/json';
        fetch('/socialman/api/user/accounts', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            accounts: updated,
            workspaceId: activeWorkspaceId,
          }),
        })
          .then((r) => r.json())
          .then((res) => {
            console.log('Persisted accounts to database:', res);
          })
          .catch((err) => {
            console.error('Failed to persist accounts to database:', err);
          });
      } catch (err) {
        console.error('Error invoking accounts API:', err);
      }

      return updated;
    });
  };

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanType | null>(null);

  const maxAiUsage = currentPlan === 'free' ? 10 : Infinity;
  const activeWorkspace: Workspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || {
    id: 'main',
    name: currentUser?.fullName ? `فضای کاری ${currentUser.fullName}` : 'فضای کاری اصلی',
    category: 'کسب‌وکار',
    connectedPlatforms: Object.keys(connectedAccounts).filter(
      (k) => connectedAccounts[k as SocialPlatform]?.isConnected
    ) as SocialPlatform[],
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginUser = (userData: Omit<UserProfile, 'isLoggedIn'>, token?: string) => {
    const fullUser: UserProfile = {
      ...userData,
      isLoggedIn: true,
    };
    setCurrentUser(fullUser);
    if (userData.plan) {
      setCurrentPlan(userData.plan as PlanType);
    }
    try {
      localStorage.setItem('socialman_user', JSON.stringify(fullUser));
      if (token) {
        localStorage.setItem('socialman_token', token);
      }
    } catch (_) {}
    setIsAuthModalOpen(false);
  };

  const logoutUser = async () => {
    try {
      await fetch('/socialman/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    setCurrentPlan('free');
    try {
      localStorage.removeItem('socialman_user');
      localStorage.removeItem('socialman_token');
    } catch (_) {}
    window.location.href = '/socialman/login';
  };

  const updateUserAvatar = (avatarUrl?: string) => {
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        avatarUrl,
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('socialman_user', JSON.stringify(updatedUser));
      } catch (_) {}

      // Persist to database
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      try {
        const token = localStorage.getItem('socialman_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (currentUser.id) headers['x-user-id'] = currentUser.id;
        if (currentUser.phone) headers['x-user-phone'] = currentUser.phone;
      } catch (_) {}

      fetch('/socialman/api/user/avatar', {
        method: 'POST',
        headers,
        body: JSON.stringify({ avatarUrl: avatarUrl || null }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            console.log('Avatar persisted to database successfully');
          }
        })
        .catch((err) => console.error('Error persisting avatar to DB:', err));
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
    fetch('/socialman/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
    fetch('/socialman/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
    fetch('/socialman/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ id, ...updates }),
    }).catch((err) => console.error('Error updating post in DB:', err));
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));

    // Persist to real database
    fetch(`/socialman/api/posts?id=${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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
    fetch('/socialman/api/tickets', {
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
    fetch('/socialman/api/tickets', {
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
        isAuthChecked,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginUser,
        logoutUser,
        refreshSession,
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
