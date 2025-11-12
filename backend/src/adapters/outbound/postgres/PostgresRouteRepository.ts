import { Pool } from 'pg';
import { Route, RouteComparison } from '../../../core/domain/Route';
import { RouteRepository } from '../../../core/ports/RouteRepository';

export class PostgresRouteRepository implements RouteRepository {
  constructor(private db: Pool) {}

  async findAll(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
    let query = 'SELECT * FROM routes WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.vesselType) {
      query += ` AND vessel_type = $${paramIndex++}`;
      params.push(filters.vesselType);
    }
    if (filters?.fuelType) {
      query += ` AND fuel_type = $${paramIndex++}`;
      params.push(filters.fuelType);
    }
    if (filters?.year) {
      query += ` AND year = $${paramIndex++}`;
      params.push(filters.year);
    }

    query += ' ORDER BY route_id';

    const result = await this.db.query(query, params);
    return result.rows.map((row) => this.mapRowToRoute(row));
  }

  async findById(routeId: string): Promise<Route | null> {
    const result = await this.db.query('SELECT * FROM routes WHERE route_id = $1', [routeId]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToRoute(result.rows[0]);
  }

  async setBaseline(routeId: string): Promise<void> {
    // First, unset all baselines
    await this.db.query('UPDATE routes SET is_baseline = FALSE');
    // Then set the new baseline
    await this.db.query('UPDATE routes SET is_baseline = TRUE WHERE route_id = $1', [routeId]);
  }

  async getBaseline(): Promise<Route | null> {
    const result = await this.db.query('SELECT * FROM routes WHERE is_baseline = TRUE LIMIT 1');
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToRoute(result.rows[0]);
  }

  async getComparison(targetIntensity: number = 89.3368): Promise<RouteComparison[]> {
    const baseline = await this.getBaseline();
    if (!baseline) {
      return [];
    }

    const allRoutes = await this.findAll();
    const comparisons: RouteComparison[] = [];

    for (const route of allRoutes) {
      if (route.routeId === baseline.routeId) {
        continue;
      }

      const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
      const compliant = route.ghgIntensity <= targetIntensity;

      comparisons.push({
        routeId: route.routeId,
        baseline,
        comparison: route,
        percentDiff,
        compliant,
      });
    }

    return comparisons;
  }

  private mapRowToRoute(row: any): Route {
    return {
      id: row.id,
      routeId: row.route_id,
      vesselType: row.vessel_type,
      fuelType: row.fuel_type,
      year: row.year,
      ghgIntensity: parseFloat(row.ghg_intensity),
      fuelConsumption: parseFloat(row.fuel_consumption),
      distance: parseFloat(row.distance),
      totalEmissions: parseFloat(row.total_emissions),
      isBaseline: row.is_baseline,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}


