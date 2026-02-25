export type ReportReason = 'spam' | 'scam' | 'illegal' | 'other';

export interface Report {
  id: string;
  reporter_id: string;
  listing_id: string | null;
  reported_user_id: string | null;
  reason: ReportReason;
  created_at: string;
}

export interface CreateReportInput {
  listing_id?: string;
  reported_user_id?: string;
  reason: ReportReason;
}
