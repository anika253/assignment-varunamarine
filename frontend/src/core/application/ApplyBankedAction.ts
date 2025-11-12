import { BankingActionResult } from '../domain/Banking';
import { BankingServicePort } from '../ports/BankingServicePort';

export class ApplyBankedAction {
  constructor(private bankingService: BankingServicePort) {}

  execute(shipId: string, year: number, amount: number): Promise<BankingActionResult> {
    return this.bankingService.applyBanked(shipId, year, amount);
  }
}
