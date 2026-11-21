export type PlanType = 'free' | 'pro' | 'agency';

export type SocialPlatform = 'instagram' | 'telegram' | 'whatsapp' | 'bale' | 'rubika';

export type PostStatus = 'draft' | 'pending_approval' | 'approved' | 'published';

export type ContentTone = 'friendly' | 'informative' | 'professional' | 'promotional' | 'storytelling';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'answered' | 'closed';
export type TicketDepartment = 'technical' | 'billing' | 'channels' | 'feature_request';

export interface TicketMessage {
  id: string;
  sender: 'user' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  trackingCode: string;
  subject: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  createdAtShamsi: string;
  updatedAtShamsi: string;
  messages: TicketMessage[];
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  username?: string;
  role: string;
  plan?: PlanType;
  isLoggedIn: boolean;
  verifiedVia?: string;
  avatarUrl?: string;
}

export interface ConnectedAccountInfo {
  platform: SocialPlatform;
  isConnected: boolean;
  accountName: string;
  handle: string;
  botUsername?: string;
  botToken?: string;
  connectedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  category: string;
  avatar?: string;
  connectedPlatforms: SocialPlatform[];
}

export interface Post {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  hook?: string;
  cta?: string;
  hashtags: string[];
  platform: SocialPlatform;
  status: PostStatus;
  scheduledDateShamsi: string; // e.g. "۱۴۰۳/۰۹/۰۵"
  scheduledTime: string; // e.g. "۱۸:۳۰"
  createdAt: string;
  clientComment?: string;
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceFormatted: string;
  popular?: boolean;
  maxWorkspaces: number;
  maxAiGenerations: number;
  hasClientPortal: boolean;
  teamMembers: number;
  features: string[];
}

export interface AiGenerationParams {
  topic: string;
  platform: SocialPlatform;
  tone: ContentTone;
  keywords?: string;
}

export interface AiGenerationResponse {
  hook: string;
  content: string;
  cta: string;
  hashtags: string[];
  suggestedBestTime: string;
}
