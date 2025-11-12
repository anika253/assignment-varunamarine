import { BankingResult } from '../domain/Banking';
import { ComplianceBalance } from '../domain/Compliance';
import { BankingRepository } from '../ports/BankingRepository';
import { ComplianceRepository } from '../ports/ComplianceRepository';

export class ApplyBanked {
  constructor(
    private complianceRepository: ComplianceRepository,
    private bankingRepository: BankingRepository
  ) {}

  async execute(shipId: string, year: number, amount: number): Promise<BankingResult> {
    // Get current compliance balance
    const cb = await this.complianceRepository.getComplianceBalance(shipId, year);
    if (!cb) {
      throw new Error(`Compliance balance not found for shipId: ${shipId}, year: ${year}`);
    }

    // Get available banked amount
    const bankedAmount = await this.bankingRepository.getBankedAmount(shipId, year);
    if (amount > bankedAmount) {
      throw new Error(`Cannot apply: Requested amount (${amount}) exceeds banked amount (${bankedAmount})`);
    }

    const cbBefore = cb.cbGco2eq;
    const applied = amount;
    const cbAfter = cbBefore + applied; // Adding banked surplus to deficit

    // Update compliance balance
    const updatedCb: ComplianceBalance = {
      ...cb,
      cbGco2eq: cbAfter,
    };
    await this.complianceRepository.saveComplianceBalance(updatedCb);

    return {
      cbBefore,
      applied,
      cbAfter,
    };
  }
}


