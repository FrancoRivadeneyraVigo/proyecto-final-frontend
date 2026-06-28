export type ReportReason =
  | 'fake_article'
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
