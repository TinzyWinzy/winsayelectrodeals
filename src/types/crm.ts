export type CommChannel = "whatsapp" | "phone" | "email" | "sms" | "in-person" | "other";
export type CommDirection = "inbound" | "outbound";

export interface CustomerNote {
  id: string;
  customerId: string;
  noteType: string;
  content: string;
  createdBy: string | null;
  createdAt: string;
}

export interface CommunicationLog {
  id: string;
  customerId: string;
  channel: CommChannel;
  direction: CommDirection;
  subject: string | null;
  content: string | null;
  status: string;
  logMetadata: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
}
