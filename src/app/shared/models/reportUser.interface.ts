export type ReportReason =
  | 'FAKE_ITEM'
  | 'FRAUD'
  | 'SUSPICIOUS_PRICE'
  | 'SPAM'
  | 'INAPPROPRIATE_CONTENT'
  | 'OTHER';

export interface IReportReasonOption {
  value: ReportReason;
  label: string;
}

export const REPORT_REASON_OPTIONS: IReportReasonOption[] = [
  { value: 'FAKE_ITEM', label: 'Artículo falso' },
  { value: 'FRAUD', label: 'Fraude' },
  { value: 'SUSPICIOUS_PRICE', label: 'Precio sospechoso' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Contenido inapropiado' },
  { value: 'OTHER', label: 'Otro' },
];

export interface IReportProfileRequest {
  reason: ReportReason;
  comment?: string;
}
