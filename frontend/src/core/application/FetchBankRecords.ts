import { BankRecord } from '../domain/Banking';
import { BankingServicePort } from '../ports/BankingServicePort';

export class FetchBankRecords {
  constructor(private bankingService: BankingServicePort) {}

  execute(shipId: string, year: number): Promise<BankRecord[]> {
    return this.bankingService.listBankRecords(shipId, year);
  }
}
