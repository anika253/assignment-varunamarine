import { ComputeComplianceBalance } from '../../core/application/ComputeComplianceBalance';
import { Route } from '../../core/domain/Route';
import { ComplianceBalance, AdjustedComplianceBalance } from '../../core/domain/Compliance';
import { RouteRepository } from '../../core/ports/RouteRepository';
import { ComplianceRepository } from '../../core/ports/ComplianceRepository';
import { RouteComparison } from '../../core/domain/Route';

class InMemoryRouteRepository implements RouteRepository {
  routes = new Map<string, Route>();

  async findAll(_filters?: { vesselType?: string | undefined; fuelType?: string | undefined; year?: number | undefined }): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async findById(routeId: string): Promise<Route | null> {
    return this.routes.get(routeId) ?? null;
  }

  async setBaseline(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getBaseline(): Promise<Route | null> {
    throw new Error('Method not implemented.');
  }

  async getComparison(): Promise<RouteComparison[]> {
    throw new Error('Method not implemented.');
  }
}

class InMemoryComplianceRepository implements ComplianceRepository {
  records = new Map<string, ComplianceBalance>();

  async saveComplianceBalance(cb: ComplianceBalance): Promise<void> {
    this.records.set(`${cb.shipId}-${cb.year}`, cb);
  }

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return this.records.get(`${shipId}-${year}`) ?? null;
  }

  async getAdjustedComplianceBalance(): Promise<AdjustedComplianceBalance | null> {
    throw new Error('Method not implemented.');
  }
}

const makeRoute = (overrides: Partial<Route> = {}): Route => ({
  routeId: 'R001',
  vesselType: 'Container',
  fuelType: 'HFO',
  year: 2024,
  ghgIntensity: 88,
  fuelConsumption: 5000,
  distance: 12000,
  totalEmissions: 4500,
  isBaseline: false,
  ...overrides,
});

describe('ComputeComplianceBalance', () => {
  it('computes CB and persists it', async () => {
    const routeRepo = new InMemoryRouteRepository();
    const complianceRepo = new InMemoryComplianceRepository();
    const useCase = new ComputeComplianceBalance(routeRepo, complianceRepo);

    routeRepo.routes.set('R001', makeRoute());

    const cb = await useCase.execute('R001', 2024);

    const expected = (89.3368 - 88) * 5000 * 41000;
    expect(cb.cbGco2eq).toBeCloseTo(expected, 5);

    const saved = await complianceRepo.getComplianceBalance('R001', 2024);
    expect(saved?.cbGco2eq).toBeCloseTo(expected, 5);
  });

  it('throws when route is missing', async () => {
    const routeRepo = new InMemoryRouteRepository();
    const complianceRepo = new InMemoryComplianceRepository();
    const useCase = new ComputeComplianceBalance(routeRepo, complianceRepo);

    await expect(useCase.execute('UNKNOWN', 2024)).rejects.toThrow('Route not found');
  });
});
