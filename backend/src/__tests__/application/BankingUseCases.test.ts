import { BankSurplus } from '../../core/application/BankSurplus';
import { ApplyBanked } from '../../core/application/ApplyBanked';
import { ComplianceRepository } from '../../core/ports/ComplianceRepository';
import { BankingRepository } from '../../core/ports/BankingRepository';
import { ComplianceBalance, AdjustedComplianceBalance } from '../../core/domain/Compliance';
import { BankEntry } from '../../core/domain/Banking';

class InMemoryComplianceRepository implements ComplianceRepository {
  balances = new Map<string, ComplianceBalance>();

  async saveComplianceBalance(cb: ComplianceBalance): Promise<void> {
    this.balances.set(`${cb.shipId}-${cb.year}`, cb);
  }

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return this.balances.get(`${shipId}-${year}`) ?? null;
  }

  async getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null> {
    const balance = this.balances.get(`${shipId}-${year}`);
    if (!balance) {
      return null;
    }

    return {
      ...balance,
      adjustedCb: balance.cbGco2eq,
    };
  }
}

class InMemoryBankingRepository implements BankingRepository {
  entries: BankEntry[] = [];

  async saveBankEntry(entry: BankEntry): Promise<void> {
    this.entries.push({ ...entry, id: this.entries.length + 1 });
  }

  async getBankedAmount(shipId: string, year: number): Promise<number> {
    return this.entries
      .filter((e) => e.shipId === shipId && e.year === year)
      .reduce((sum, entry) => sum + entry.amountGco2eq, 0);
  }

  async getAllBankEntries(shipId: string, year: number): Promise<BankEntry[]> {
    return this.entries.filter((e) => e.shipId === shipId && e.year === year);
  }
}

describe('BankSurplus', () => {
  it('banks positive compliance balance', async () => {
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const useCase = new BankSurplus(complianceRepo, bankingRepo);

    await complianceRepo.saveComplianceBalance({ shipId: 'R001', year: 2024, cbGco2eq: 1000 });

    const banked = await useCase.execute('R001', 2024);

    expect(banked.amountGco2eq).toBe(1000);
    expect(bankingRepo.entries).toHaveLength(1);
  });

  it('rejects when CB is not positive', async () => {
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const useCase = new BankSurplus(complianceRepo, bankingRepo);

    await complianceRepo.saveComplianceBalance({ shipId: 'R002', year: 2024, cbGco2eq: -50 });

    await expect(useCase.execute('R002', 2024)).rejects.toThrow('Cannot bank');
  });
});

describe('ApplyBanked', () => {
  it('applies banked surplus to deficit', async () => {
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const useCase = new ApplyBanked(complianceRepo, bankingRepo);

    await complianceRepo.saveComplianceBalance({ shipId: 'R003', year: 2024, cbGco2eq: -500 });
    await bankingRepo.saveBankEntry({ shipId: 'R003', year: 2024, amountGco2eq: 600 });

    const result = await useCase.execute('R003', 2024, 300);

    expect(result.cbBefore).toBe(-500);
    expect(result.applied).toBe(300);
    expect(result.cbAfter).toBe(-200);

    const updated = await complianceRepo.getComplianceBalance('R003', 2024);
    expect(updated?.cbGco2eq).toBe(-200);
  });

  it('rejects when applying more than banked', async () => {
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const useCase = new ApplyBanked(complianceRepo, bankingRepo);

    await complianceRepo.saveComplianceBalance({ shipId: 'R004', year: 2024, cbGco2eq: -100 });
    await bankingRepo.saveBankEntry({ shipId: 'R004', year: 2024, amountGco2eq: 50 });

    await expect(useCase.execute('R004', 2024, 200)).rejects.toThrow('Cannot apply');
  });
});
