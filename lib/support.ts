export type SupportTicketCategory = 'inquiry' | 'bug' | 'feedback';
export type SupportTicketStatus = 'pending' | 'in_progress' | 'resolved';

export type SupportTicket = {
  id: string;
  user_id: string;
  category: SupportTicketCategory;
  title: string;
  content: string;
  status: SupportTicketStatus;
  username_snapshot: string | null;
  email_snapshot: string | null;
  admin_note: string | null;
  resolved_at: string | null;
  created_at: string;
};

export const SUPPORT_CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  inquiry: '문의',
  bug: '버그 제보',
  feedback: '의견/기능 제안',
};

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  pending: '대기중',
  in_progress: '처리중',
  resolved: '해결됨',
};
