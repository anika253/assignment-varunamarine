import { Request, Response } from 'express';
import { RouteRepository } from '../../../core/ports/RouteRepository';
import { GetRouteComparison } from '../../../core/application/GetRouteComparison';
import { ComputeComplianceBalance } from '../../../core/application/ComputeComplianceBalance';
import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';

export class RoutesController {
  constructor(
    private routeRepository: RouteRepository,
    private complianceRepository: ComplianceRepository
  ) {}

  async getAllRoutes(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        vesselType: req.query.vesselType as string | undefined,
        fuelType: req.query.fuelType as string | undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
      };
      const routes = await this.routeRepository.findAll(filters);
      res.json(routes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async setBaseline(req: Request, res: Response): Promise<void> {
    try {
      const { routeId } = req.params;
      await this.routeRepository.setBaseline(routeId);
      res.json({ message: `Route ${routeId} set as baseline` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getComparison(req: Request, res: Response): Promise<void> {
    try {
      const useCase = new GetRouteComparison(this.routeRepository);
      const comparisons = await useCase.execute();
      res.json(comparisons);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async computeComplianceBalance(req: Request, res: Response): Promise<void> {
    try {
      const shipId = req.query.shipId as string;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

      if (!shipId) {
        res.status(400).json({ error: 'shipId is required' });
        return;
      }

      const useCase = new ComputeComplianceBalance(this.routeRepository, this.complianceRepository);
      const cb = await useCase.execute(shipId, year);
      res.json(cb);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}


