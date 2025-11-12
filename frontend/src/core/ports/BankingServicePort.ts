import { BankRecord, BankingActionResult } from '../domain/Banking';

export interface BankingServicePort {
  listBankRecords(shipId: string, year: number): Promise<BankRecord[]>;
  bankSurplus(shipId: string, year: number): Promise<BankRecord>;
  applyBanked(shipId: string, year: number, amount: number): Promise<BankingActionResult>;
}
