export type ReportReason =
  | 'scam_attempt'
  | 'spam'
  | 'inappropriate_content'
  | 'other';

export interface IReportReasonOption {
  value: ReportReason;
  label: string;
}

export const REPORT_REASON_OPTIONS: IReportReasonOption[] = [
  { value: 'scam_attempt', label: 'Fraude' },
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate_content', label: 'Contenido inapropiado' },
  { value: 'other', label: 'Otro' },
];

export interface IReportProfileRequest {
  reason: ReportReason;
  comments?: string;
}
