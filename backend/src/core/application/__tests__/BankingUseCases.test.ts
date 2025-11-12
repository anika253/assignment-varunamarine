import { BankSurplus } from '../BankSurplus';
import { ApplyBanked } from '../ApplyBanked';
import { ComplianceRepository } from '../../ports/ComplianceRepository';
import { BankingRepository } from '../../ports/BankingRepository';
import { ComplianceBalance, AdjustedComplianceBalance } from '../../domain/Compliance';
import { BankEntry } from '../../domain/Banking';

class InMemoryComplianceRepository implements ComplianceRepository {
  private balances = new Map<string, ComplianceBalance>();

  async saveComplianceBalance(cb: ComplianceBalance): Promise<void> {
    this.balances.set(`${cb.shipId}-${cb.year}`, cb);
  }

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return this.balances.get(`${shipId}-${year}`) ?? null;
  }

  async getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null> {
    const cb = await this.getComplianceBalance(shipId, year);
    return cb ? { ...cb, adjustedCb: cb.cbGco2eq } : null;
  }
}

class InMemoryBankingRepository implements BankingRepository {
  private entries: BankEntry[] = [];

  async saveBankEntry(entry: BankEntry): Promise<void> {
    this.entries.push(entry);
  }

  async getBankedAmount(shipId: string, year: number): Promise<number> {
    return this.entries
      .filter((entry) => entry.shipId === shipId && entry.year === year)
      .reduce((sum, entry) => sum + entry.amountGco2eq, 0);
  }

  async getAllBankEntries(shipId: string, year: number): Promise<BankEntry[]> {
    return this.entries.filter((entry) => entry.shipId === shipId && entry.year === year);
  }
}

describe('Banking use cases', () => {
  it('banks positive compliance balance', async () => {
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const bankSurplus = new BankSurplus(complianceRepo, bankingRepo);

    await complianceRepo.saveComplianceBalance({ shipId: 'SHIP1', year: 2025, cbGco2eq: 500 });

    const entry = await bankSurplus.execute('SHIP1', 2025);
    expect(entry.amountGco2eq).toBe(500);

    const banked = await bankingRepo.getBankedAmount('SHIP1', 2025);
    expect(banked).toBe(500);
  });

  it('throws when banking non-positive balance', async () => {
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const bankSurplus = new BankSurplus(complianceRepo, bankingRepo);

    await complianceRepo.saveComplianceBalance({ shipId: 'SHIP2', year: 2025, cbGco2eq: -100 });

    await expect(bankSurplus.execute('SHIP2', 2025)).rejects.toThrow('Cannot bank: Compliance balance is not positive (no surplus)');
  });

  it('applies banked amount to deficit', async () => {
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const applyBanked = new ApplyBanked(complianceRepo, bankingRepo);

    await complianceRepo.saveComplianceBalance({ shipId: 'SHIP3', year: 2025, cbGco2eq: -300 });
    await bankingRepo.saveBankEntry({ shipId: 'SHIP3', year: 2025, amountGco2eq: 400 });

    const result = await applyBanked.execute('SHIP3', 2025, 200);

    expect(result.cbBefore).toBe(-300);
    expect(result.applied).toBe(200);
    expect(result.cbAfter).toBe(-100);

    const updated = await complianceRepo.getComplianceBalance('SHIP3', 2025);
    expect(updated?.cbGco2eq).toBe(-100);
  });

  it('rejects applying more than banked', async () => {
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const applyBanked = new ApplyBanked(complianceRepo, bankingRepo);

    await complianceRepo.saveComplianceBalance({ shipId: 'SHIP4', year: 2025, cbGco2eq: -300 });
    await bankingRepo.saveBankEntry({ shipId: 'SHIP4', year: 2025, amountGco2eq: 100 });

    await expect(applyBanked.execute('SHIP4', 2025, 200)).rejects.toThrow('Cannot apply: Requested amount (200) exceeds banked amount (100)');
  });
});
