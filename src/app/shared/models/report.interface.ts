export type ReportReason =
  | 'fake_item'
  | 'scam_attempt'
  | 'suspicious_price'
  | 'spam'
  | 'inappropriate_content'
  | 'other';

export type ReportStatus = 'PENDING' | 'UNDER REVIEW' | 'RESOLVED';

export type ReportResolution = 'APPROVED' | 'REJECTED';

export type ReportStatusFilter = ReportStatus | 'all';

export type ReportByType = 'articulo' | 'usuario';

export interface IReportFilters {
  status?: ReportStatusFilter;
  search?: string;
  reason?: ReportReason;
  byreportype?: ReportByType;
  created_from?: string;
  created_to?: string;
  page?: number;
  limit?: number;
}

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
  resolution: ReportResolution | null;
  created_at: string;
  resolved_at: string | null;
  article_id: number | null;
  reported_user_id: number | null;
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
  resolution: ReportResolution | null;
  moderator_note: string | null;
  article_id: number | null;
  reported_user_id: number | null;
  reporter_id: number;
  moderator_id: number | null;
  article_title: string | null;
  article_status: string | null;
  seller_id: number | null;
  reporter_email: string;
}

export interface IRejectReportRequest {
  moderator_note?: string;
}

export interface ICreateProfileReportRequest {
  reason: ReportReason;
  comments: string;
}
