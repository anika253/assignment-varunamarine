import { httpRequest } from '../../../shared/http';
import { BankRecord, BankingActionResult } from '../../../core/domain/Banking';
import { BankingServicePort } from '../../../core/ports/BankingServicePort';

export class BankingHttpService implements BankingServicePort {
  listBankRecords(shipId: string, year: number): Promise<BankRecord[]> {
    const query = new URLSearchParams({ shipId, year: String(year) }).toString();
    return httpRequest<BankRecord[]>(`/banking/records?${query}`);
  }

  bankSurplus(shipId: string, year: number): Promise<BankRecord> {
    return httpRequest<BankRecord>('/banking/bank', {
      method: 'POST',
      body: JSON.stringify({ shipId, year }),
    });
  }

  applyBanked(shipId: string, year: number, amount: number): Promise<BankingActionResult> {
    return httpRequest<BankingActionResult>('/banking/apply', {
      method: 'POST',
      body: JSON.stringify({ shipId, year, amount }),
    });
  }
}
