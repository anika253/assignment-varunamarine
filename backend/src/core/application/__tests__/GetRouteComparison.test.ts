import { GetRouteComparison } from '../GetRouteComparison';
import { Route } from '../../domain/Route';
import { RouteRepository } from '../../ports/RouteRepository';

class InMemoryRouteRepository implements RouteRepository {
  constructor(private routes: Route[]) {}

  async findAll(): Promise<Route[]> {
    return this.routes;
  }

  async findById(): Promise<Route | null> {
    return null;
  }

  async setBaseline(routeId: string): Promise<void> {
    this.routes = this.routes.map((route) => ({
      ...route,
      isBaseline: route.routeId === routeId,
    }));
  }

  async getBaseline(): Promise<Route | null> {
    return this.routes.find((route) => route.isBaseline) ?? null;
  }

  async getComparison(): Promise<any[]> {
    return [];
  }
}

describe('GetRouteComparison', () => {
  const routes: Route[] = [
    {
      routeId: 'R001',
      vesselType: 'Container',
      fuelType: 'HFO',
      year: 2024,
      ghgIntensity: 90,
      fuelConsumption: 0,
      distance: 0,
      totalEmissions: 0,
      isBaseline: true,
    },
    {
      routeId: 'R002',
      vesselType: 'Bulk',
      fuelType: 'LNG',
      year: 2024,
      ghgIntensity: 85,
      fuelConsumption: 0,
      distance: 0,
      totalEmissions: 0,
      isBaseline: false,
    },
  ];

  it('returns comparison data with percent diff and compliance flag', async () => {
    const repo = new InMemoryRouteRepository(routes);
    const useCase = new GetRouteComparison(repo);

    const result = await useCase.execute(89.3368);

    expect(result).toHaveLength(1);
    expect(result[0].routeId).toBe('R002');
    expect(result[0].percentDiff).toBeCloseTo((85 / 90 - 1) * 100, 5);
    expect(result[0].compliant).toBe(true);
  });

  it('throws when baseline is missing', async () => {
    const repo = new InMemoryRouteRepository(routes.map((route) => ({ ...route, isBaseline: false })));
    const useCase = new GetRouteComparison(repo);

    await expect(useCase.execute()).rejects.toThrow('No baseline route found');
  });
});
