import { BankEntry } from '../domain/Banking';
import { ComplianceBalance } from '../domain/Compliance';
import { BankingRepository } from '../ports/BankingRepository';
import { ComplianceRepository } from '../ports/ComplianceRepository';

export class BankSurplus {
  constructor(
    private complianceRepository: ComplianceRepository,
    private bankingRepository: BankingRepository
  ) {}

  async execute(shipId: string, year: number): Promise<BankEntry> {
    // Get current compliance balance
    const cb = await this.complianceRepository.getComplianceBalance(shipId, year);
    if (!cb) {
      throw new Error(`Compliance balance not found for shipId: ${shipId}, year: ${year}`);
    }

    // Only bank positive CB (surplus)
    if (cb.cbGco2eq <= 0) {
      throw new Error('Cannot bank: Compliance balance is not positive (no surplus)');
    }

    const bankEntry: BankEntry = {
      shipId,
      year,
      amountGco2eq: cb.cbGco2eq,
    };

    await this.bankingRepository.saveBankEntry(bankEntry);
    return bankEntry;
  }
}


