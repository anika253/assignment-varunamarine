import { Request, Response } from 'express';
import { PoolingRepository } from '../../../core/ports/PoolingRepository';
import { CreatePool } from '../../../core/application/CreatePool';

export class PoolingController {
  constructor(private poolingRepository: PoolingRepository) {}

  async createPool(req: Request, res: Response): Promise<void> {
    try {
      const { year, members } = req.body;

      if (!year || !members || !Array.isArray(members)) {
        res.status(400).json({ error: 'year and members array are required' });
        return;
      }

      const useCase = new CreatePool(this.poolingRepository);
      const result = await useCase.execute({ year, members });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}


