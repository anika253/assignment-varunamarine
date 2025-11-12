import { Request, Response } from 'express';
import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';

export class ComplianceController {
  constructor(private complianceRepository: ComplianceRepository) {}

  async getComplianceBalance(req: Request, res: Response): Promise<void> {
    try {
      const shipId = req.query.shipId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      const cb = await this.complianceRepository.getComplianceBalance(shipId, year);
      if (!cb) {
        res.status(404).json({ error: 'Compliance balance not found' });
        return;
      }

      res.json(cb);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAdjustedComplianceBalance(req: Request, res: Response): Promise<void> {
    try {
      const shipId = req.query.shipId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      const adjustedCb = await this.complianceRepository.getAdjustedComplianceBalance(shipId, year);
      if (!adjustedCb) {
        res.status(404).json({ error: 'Adjusted compliance balance not found' });
        return;
      }

      res.json(adjustedCb);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}


