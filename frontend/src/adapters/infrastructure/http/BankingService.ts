import { BankingPort } from '../../../core/ports/BankingPort';
import { ApiClient } from './apiClient';
import { BankEntry } from '../../../core/types/banking';
import { BankingKpis } from '../../../core/domain/compliance';

export class BankingService implements BankingPort {
  constructor(private client: ApiClient = new ApiClient()) {}

  getBankingRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return this.client.get<BankEntry[]>('/banking/records', { shipId, year });
  }

  bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    return this.client.post<BankEntry>('/banking/bank', { shipId, year });
  }

  applyBanked(shipId: string, year: number, amount: number): Promise<BankingKpis> {
    return this.client.post<BankingKpis>('/banking/apply', { shipId, year, amount });
  }
}
