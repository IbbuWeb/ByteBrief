export interface User {
  id: string;
  email: string;
}

export interface Account {
  id: string;
  userId: string;
  provider: "gmail" | "outlook" | "imap";
  email: string;
  accessTokenEncrypted?: string | null;
  refreshTokenEncrypted?: string | null;
  imapHost?: string | null;
  imapPort?: number | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  isActive: boolean;
}

export interface Email {
  id: string;
  accountId: string;
  messageId: string;
  threadId?: string | null;
  subject?: string | null;
  fromName?: string | null;
  fromEmail?: string | null;
  toEmails: string[];
  ccEmails: string[];
  bccEmails: string[];
  bodyText?: string | null;
  bodyHtml?: string | null;
  snippet?: string | null;
  isRead: boolean;
  isFlagged: boolean;
  isDraft: boolean;
  isSpam: boolean;
  isTrashed: boolean;
  folder: string;
  receivedAt?: string | null;
  sentAt?: string | null;
}

export interface ApiError {
  error: string;
}
