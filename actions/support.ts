'use server';

import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { requireAdminUser, requireApprovedUser } from '@/lib/server-auth';

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

const CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  inquiry: '문의',
  bug: '버그 제보',
  feedback: '의견/기능 제안',
};

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.');
  }

  return createClient(url, key);
}

function getSupportRecipientList() {
  const configured = (process.env.SUPPORT_NOTIFY_EMAILS || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  return Array.from(new Set([...configured, 'dmswl6310@gmail.com']));
}

async function sendSupportNotificationEmail(ticket: SupportTicket) {
  const smtpUser = process.env.SUPPORT_SMTP_USER;
  const smtpPass = process.env.SUPPORT_SMTP_PASS;
  const recipients = getSupportRecipientList();

  if (!smtpUser || !smtpPass || recipients.length === 0) {
    return { sent: false, reason: 'missing-config' as const };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: `Volunteer Platform <${smtpUser}>`,
    to: recipients,
    replyTo: ticket.email_snapshot || undefined,
    subject: `[고객문의] ${CATEGORY_LABELS[ticket.category]} - ${ticket.title}`,
    text: [
      `문의 종류: ${CATEGORY_LABELS[ticket.category]}`,
      `작성자: ${ticket.username_snapshot || '알 수 없음'}`,
      `이메일: ${ticket.email_snapshot || '-'}`,
      `작성일: ${new Date(ticket.created_at).toLocaleString('ko-KR')}`,
      '',
      ticket.content,
      '',
      `관리 페이지에서 확인해 주세요.`,
    ].join('\n'),
  });

  return { sent: true as const };
}

export async function createSupportTicket(input: {
  category: SupportTicketCategory;
  title: string;
  content: string;
}) {
  const { user, profile } = await requireApprovedUser();
  const supabaseAdmin = getSupabaseAdmin();

  const title = input.title.trim();
  const content = input.content.trim();

  if (!title || !content) {
    throw new Error('제목과 내용을 모두 입력해 주세요.');
  }

  const ticket: SupportTicket = {
    id: crypto.randomUUID(),
    user_id: user.id,
    category: input.category,
    title,
    content,
    status: 'pending',
    username_snapshot: profile.username ?? null,
    email_snapshot: profile.email ?? user.email ?? null,
    admin_note: null,
    resolved_at: null,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin.from('support_tickets').insert(ticket);

  if (error) {
    throw new Error(error.message || '문의 저장 중 오류가 발생했습니다.');
  }

  try {
    await sendSupportNotificationEmail(ticket);
  } catch (emailError) {
    console.error('Support notification email failed:', emailError);
  }

  revalidatePath('/mypage/support');
  revalidatePath('/admin');
}

export async function getAdminSupportTickets() {
  const { supabase } = await requireAdminUser();

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message || '문의 목록을 불러오지 못했습니다.');
  }

  return (data ?? []) as SupportTicket[];
}

export async function updateSupportTicketStatus(input: {
  ticketId: string;
  status: SupportTicketStatus;
  adminNote?: string;
}) {
  const { supabase } = await requireAdminUser();

  const { data: existingTicket, error: existingError } = await supabase
    .from('support_tickets')
    .select('admin_note')
    .eq('id', input.ticketId)
    .single();

  if (existingError) {
    throw new Error(existingError.message || '문의 정보를 불러오지 못했습니다.');
  }

  const nextAdminNote = input.adminNote !== undefined
    ? (input.adminNote.trim() || null)
    : (existingTicket?.admin_note ?? null);

  const payload: Record<string, string | null> = {
    status: input.status,
    admin_note: nextAdminNote,
    resolved_at: input.status === 'resolved' ? new Date().toISOString() : null,
  };

  const { error } = await supabase
    .from('support_tickets')
    .update(payload)
    .eq('id', input.ticketId);

  if (error) {
    throw new Error(error.message || '문의 상태 변경 중 오류가 발생했습니다.');
  }

  revalidatePath('/admin');
  revalidatePath('/mypage/support');
}
