export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number;
  cbBefore?: number;
  cbAfter?: number;
}

export interface AdjustedComplianceBalance extends ComplianceBalance {
  adjustedCb: number;
}

export interface BankingKpis {
  cb_before: number;
  applied: number;
  cb_after: number;
}
