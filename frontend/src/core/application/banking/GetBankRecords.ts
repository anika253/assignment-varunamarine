import { BankingPort } from '../../ports/BankingPort';
import { BankEntry } from '../../types/banking';

export class GetBankRecords {
  constructor(private bankingPort: BankingPort) {}

  execute(shipId: string, year: number): Promise<BankEntry[]> {
    return this.bankingPort.getBankingRecords(shipId, year);
  }
}
