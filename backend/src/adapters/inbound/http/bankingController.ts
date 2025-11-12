import { Request, Response } from 'express';
import { BankingRepository } from '../../../core/ports/BankingRepository';
import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';
import { BankSurplus } from '../../../core/application/BankSurplus';
import { ApplyBanked } from '../../../core/application/ApplyBanked';

export class BankingController {
  constructor(
    private bankingRepository: BankingRepository,
    private complianceRepository: ComplianceRepository
  ) {}

  async getBankRecords(req: Request, res: Response): Promise<void> {
    try {
      const shipId = req.query.shipId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      const records = await this.bankingRepository.getAllBankEntries(shipId, year);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async bankSurplus(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.body;

      if (!shipId || !year) {
        res.status(400).json({ error: 'shipId and year are required' });
        return;
      }

      const useCase = new BankSurplus(this.complianceRepository, this.bankingRepository);
      const bankEntry = await useCase.execute(shipId, year);
      res.json(bankEntry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async applyBanked(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year, amount } = req.body;

      if (!shipId || !year || amount === undefined) {
        res.status(400).json({ error: 'shipId, year, and amount are required' });
        return;
      }

      const useCase = new ApplyBanked(this.complianceRepository, this.bankingRepository);
      const result = await useCase.execute(shipId, year, amount);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}


