import { BankEntry } from '../types/banking';
import { BankingKpis } from '../domain/compliance';

export interface BankingPort {
  getBankingRecords(shipId: string, year: number): Promise<BankEntry[]>;
  bankSurplus(shipId: string, year: number): Promise<BankEntry>;
  applyBanked(shipId: string, year: number, amount: number): Promise<BankingKpis>;
}
