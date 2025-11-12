import { BankEntry } from '../domain/Banking';

export interface BankingRepository {
  saveBankEntry(entry: BankEntry): Promise<void>;
  getBankedAmount(shipId: string, year: number): Promise<number>;
  getAllBankEntries(shipId: string, year: number): Promise<BankEntry[]>;
}


