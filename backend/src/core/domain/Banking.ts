export interface BankEntry {
  id?: number;
  shipId: string;
  year: number;
  amountGco2eq: number;
  createdAt?: Date;
}

export interface BankingResult {
  cbBefore: number;
  applied: number;
  cbAfter: number;
}


