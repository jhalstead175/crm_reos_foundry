export type LeadScore = 'A' | 'B' | 'C' | 'D' | 'F';

export type ContactSource =
  | 'Website'
  | 'Zillow'
  | 'Realtor.com'
  | 'Referral'
  | 'Past Client'
  | 'Cold Call'
  | 'Open House'
  | 'Social Media'
  | 'Other';

export type ContactStatus =
  | 'New Lead'
  | 'Nurturing'
  | 'Hot'
  | 'Under Contract'
  | 'Closed'
  | 'Dead';

export type ContactEventType = 'call' | 'text' | 'email' | 'meeting' | 'note';

export type ContactEventDirection = 'inbound' | 'outbound';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  lead_score: LeadScore;
  source: ContactSource;
  status: ContactStatus;
  created_at: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface ContactEvent {
  id: string;
  contact_id: string;
  type: ContactEventType;
  direction: ContactEventDirection;
  payload: Record<string, any>;
  created_at: string;
}
