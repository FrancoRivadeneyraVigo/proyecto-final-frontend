export type ReportReason =
  | 'fake_item'
  | 'scam_attempt'
  | 'suspicious_price'
  | 'spam'
  | 'inappropriate_content'
  | 'other';

export interface ICreateReportRequest {
  reason: ReportReason;
  comments: string;
  fk_articles_id: number;
}

export interface ICreateProfileReportRequest {
  reason: ReportReason;
  comments: string;
}
