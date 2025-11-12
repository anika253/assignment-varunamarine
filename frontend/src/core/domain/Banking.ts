export interface BankRecord {
  id?: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt?: string;
}

export interface BankingActionResult {
  cbBefore: number;
  applied: number;
  cbAfter: number;
}
