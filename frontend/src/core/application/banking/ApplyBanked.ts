import { BankingPort } from '../../ports/BankingPort';
import { BankingKpis } from '../../domain/compliance';

export class ApplyBankedUseCase {
  constructor(private bankingPort: BankingPort) {}

  execute(shipId: string, year: number, amount: number): Promise<BankingKpis> {
    return this.bankingPort.applyBanked(shipId, year, amount);
  }
}
