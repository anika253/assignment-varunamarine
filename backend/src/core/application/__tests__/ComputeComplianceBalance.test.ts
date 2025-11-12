import { ComputeComplianceBalance } from '../ComputeComplianceBalance';
import { TARGET_INTENSITY_2025, ENERGY_PER_TONNE } from '../../domain/Compliance';
import { Route } from '../../domain/Route';
import { RouteRepository } from '../../ports/RouteRepository';
import { ComplianceRepository } from '../../ports/ComplianceRepository';
import { ComplianceBalance, AdjustedComplianceBalance } from '../../domain/Compliance';

describe('ComputeComplianceBalance', () => {
  const route: Route = {
    routeId: 'R001',
    vesselType: 'Container',
    fuelType: 'HFO',
    year: 2025,
    ghgIntensity: 90,
    fuelConsumption: 1000,
    distance: 0,
    totalEmissions: 0,
    isBaseline: false,
  };

  class InMemoryRouteRepository implements RouteRepository {
    async findAll(): Promise<Route[]> {
      return [route];
    }

    async findById(routeId: string): Promise<Route | null> {
      return route.routeId === routeId ? route : null;
    }

    async setBaseline(): Promise<void> {}

    async getBaseline(): Promise<Route | null> {
      return route;
    }

    async getComparison(): Promise<any[]> {
      return [];
    }
  }

  class InMemoryComplianceRepository implements ComplianceRepository {
    private stored: ComplianceBalance | null = null;

    async saveComplianceBalance(cb: ComplianceBalance): Promise<void> {
      this.stored = cb;
    }

    async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
      if (this.stored && this.stored.shipId === shipId && this.stored.year === year) {
        return this.stored;
      }
      return null;
    }

    async getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null> {
      const cb = await this.getComplianceBalance(shipId, year);
      return cb ? { ...cb, adjustedCb: cb.cbGco2eq } : null;
    }
  }

  it('computes compliance balance and persists it', async () => {
    const routeRepo = new InMemoryRouteRepository();
    const complianceRepo = new InMemoryComplianceRepository();
    const useCase = new ComputeComplianceBalance(routeRepo, complianceRepo);

    const result = await useCase.execute('R001', 2025);

    const expected = (TARGET_INTENSITY_2025 - route.ghgIntensity) * route.fuelConsumption * ENERGY_PER_TONNE;
    expect(result.cbGco2eq).toBeCloseTo(expected, 5);

    const saved = await complianceRepo.getComplianceBalance('R001', 2025);
    expect(saved?.cbGco2eq).toBeCloseTo(expected, 5);
  });

  it('throws when route is not found', async () => {
    const routeRepo = new InMemoryRouteRepository();
    const complianceRepo = new InMemoryComplianceRepository();
    const useCase = new ComputeComplianceBalance(routeRepo, complianceRepo);

    await expect(useCase.execute('UNKNOWN', 2025)).rejects.toThrow('Route not found for shipId: UNKNOWN');
  });
});
