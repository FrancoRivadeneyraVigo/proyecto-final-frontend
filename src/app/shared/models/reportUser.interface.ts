export type ReportReason =
  | 'fake_item'
  | 'scam_attempt'
  | 'suspicious_price'
  | 'spam'
  | 'inappropriate_content'
  | 'other';

export interface IReportReasonOption {
  value: ReportReason;
  label: string;
}

export const REPORT_REASON_OPTIONS: IReportReasonOption[] = [
  { value: 'fake_item', label: 'Artículo falso' },
  { value: 'scam_attempt', label: 'Fraude' },
  { value: 'suspicious_price', label: 'Precio sospechoso' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Contenido inapropiado' },
  { value: 'other', label: 'Otro' },
];

export interface IReportProfileRequest {
  reason: ReportReason;
  comments?: string;
}
