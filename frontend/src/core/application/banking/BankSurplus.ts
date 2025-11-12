import { BankingPort } from '../../ports/BankingPort';
import { BankEntry } from '../../types/banking';

export class BankSurplusUseCase {
  constructor(private bankingPort: BankingPort) {}

  execute(shipId: string, year: number): Promise<BankEntry> {
    return this.bankingPort.bankSurplus(shipId, year);
  }
}
