import { BankRecord } from '../domain/Banking';
import { BankingServicePort } from '../ports/BankingServicePort';

export class BankSurplusAction {
  constructor(private bankingService: BankingServicePort) {}

  execute(shipId: string, year: number): Promise<BankRecord> {
    return this.bankingService.bankSurplus(shipId, year);
  }
}
