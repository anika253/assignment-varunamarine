import express from 'express';
import request from 'supertest';
import { RoutesController } from '../../adapters/inbound/http/routesController';
import { RouteRepository } from '../../core/ports/RouteRepository';
import { Route, RouteComparison } from '../../core/domain/Route';
import { ComplianceRepository } from '../../core/ports/ComplianceRepository';
import { ComplianceBalance, AdjustedComplianceBalance } from '../../core/domain/Compliance';

class InMemoryRouteRepository implements RouteRepository {
  routes: Route[] = [];

  async findAll(_filters?: { vesselType?: string | undefined; fuelType?: string | undefined; year?: number | undefined }): Promise<Route[]> {
    return this.routes;
  }

  async findById(routeId: string): Promise<Route | null> {
    return this.routes.find((r) => r.routeId === routeId) ?? null;
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

  async getComparison(): Promise<RouteComparison[]> {
    throw new Error('Method not implemented.');
  }
}

class NullComplianceRepository implements ComplianceRepository {
  async saveComplianceBalance(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getComplianceBalance(): Promise<ComplianceBalance | null> {
    throw new Error('Method not implemented.');
  }

  async getAdjustedComplianceBalance(): Promise<AdjustedComplianceBalance | null> {
    throw new Error('Method not implemented.');
  }
}

describe('RoutesController', () => {
  const setupApp = () => {
    const routeRepo = new InMemoryRouteRepository();
    routeRepo.routes = [
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

    const app = express();
    app.use(express.json());

    const controller = new RoutesController(routeRepo, new NullComplianceRepository());
    app.get('/routes', (req, res) => controller.getAllRoutes(req, res));
    app.post('/routes/:routeId/baseline', (req, res) => controller.setBaseline(req, res));
    app.get('/routes/comparison', (req, res) => controller.getComparison(req, res));

    return { app, routeRepo };
  };

  it('returns all routes', async () => {
    const { app } = setupApp();
    const response = await request(app).get('/routes');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('routeId', 'R001');
  });

  it('sets baseline route and persists flag', async () => {
    const { app, routeRepo } = setupApp();

    await request(app).post('/routes/R002/baseline');
    const updatedBaseline = await routeRepo.getBaseline();

    expect(updatedBaseline?.routeId).toBe('R002');
  });

  it('returns comparison payload', async () => {
    const { app } = setupApp();
    const response = await request(app).get('/routes/comparison');

    expect(response.status).toBe(200);
    expect(response.body[0]).toMatchObject({
      routeId: 'R002',
      compliant: true,
    });
  });
});
