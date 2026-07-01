export type ReportReason =
  | 'fake_item'
  | 'scam_attempt'
  | 'suspicious_price'
  | 'spam'
  | 'inappropriate_content'
  | 'other';

export type ReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED';

export type ReportStatusFilter = ReportStatus | 'all';

export interface ICreateReportRequest {
  reason: ReportReason;
  comments: string;
  fk_articles_id: number;
}

export interface IAdminReport {
  id: number;
  reason: ReportReason;
  comments: string;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
  article_id: number;
  name: string;
  surname: string;
  email: string;
}

export interface IReportsPaginatedResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: IAdminReport[];
}

export interface IReportDetail {
  id: number;
  reason: ReportReason;
  comments: string;
  status: ReportStatus;
  created_at: string;
  resolved_at: string | null;
  resolution: string | null;
  moderator_note: string | null;
  article_id: number;
  reporter_id: number;
  moderator_id: number | null;
  article_title: string;
  article_status: string;
  seller_id: number;
  reporter_email: string;
}

export interface IRejectReportRequest {
  moderator_note?: string;
}

export interface IModerationMessageResponse {
  message: string;
}
