import { GetRouteComparison } from '../../core/application/GetRouteComparison';
import { Route, RouteComparison } from '../../core/domain/Route';
import { RouteRepository } from '../../core/ports/RouteRepository';

class InMemoryRouteRepository implements RouteRepository {
  routes: Route[] = [];

  async findAll(_filters?: { vesselType?: string | undefined; fuelType?: string | undefined; year?: number | undefined }): Promise<Route[]> {
    return this.routes;
  }

  async findById(_routeId: string): Promise<Route | null> {
    throw new Error('Method not implemented.');
  }

  async setBaseline(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getBaseline(): Promise<Route | null> {
    return this.routes.find((route) => route.isBaseline) ?? null;
  }

  async getComparison(_targetIntensity?: number): Promise<RouteComparison[]> {
    throw new Error('Method not implemented.');
  }
}

describe('GetRouteComparison', () => {
  it('returns comparisons relative to baseline with percent diff and compliance flag', async () => {
    const repo = new InMemoryRouteRepository();
    repo.routes = [
      {
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensity: 91,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: true,
      },
      {
        routeId: 'R002',
        vesselType: 'BulkCarrier',
        fuelType: 'LNG',
        year: 2024,
        ghgIntensity: 88,
        fuelConsumption: 4800,
        distance: 11500,
        totalEmissions: 4200,
        isBaseline: false,
      },
    ];

    const useCase = new GetRouteComparison(repo);
    const [comparison] = await useCase.execute(89.3368);

    expect(comparison.routeId).toBe('R002');
    expect(comparison.percentDiff).toBeCloseTo(((88 / 91) - 1) * 100, 5);
    expect(comparison.compliant).toBe(true);
  });

  it('throws when no baseline is set', async () => {
    const repo = new InMemoryRouteRepository();
    repo.routes = [
      {
        routeId: 'R001',
        vesselType: 'Container',
        fuelType: 'HFO',
        year: 2024,
        ghgIntensity: 90,
        fuelConsumption: 5000,
        distance: 12000,
        totalEmissions: 4500,
        isBaseline: false,
      },
    ];

    const useCase = new GetRouteComparison(repo);
    await expect(useCase.execute()).rejects.toThrow('No baseline route found');
  });
});
