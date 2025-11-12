import { httpRequest } from '../../../shared/http';
import { Route, RouteFilters, RouteComparisonRow } from '../../../core/domain/Route';
import { RouteServicePort } from '../../../core/ports/RouteServicePort';

const buildQuery = (filters?: RouteFilters) => {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.vesselType) params.append('vesselType', filters.vesselType);
  if (filters.fuelType) params.append('fuelType', filters.fuelType);
  if (typeof filters.year === 'number') params.append('year', String(filters.year));
  const query = params.toString();
  return query ? `?${query}` : '';
};

export class RouteHttpService implements RouteServicePort {
  listRoutes(filters?: RouteFilters): Promise<Route[]> {
    return httpRequest<Route[]>(`/routes${buildQuery(filters)}`);
  }

  async setBaseline(routeId: string): Promise<void> {
    await httpRequest(`/routes/${routeId}/baseline`, {
      method: 'POST',
    });
  }

  getComparisons(): Promise<RouteComparisonRow[]> {
    return httpRequest<RouteComparisonRow[]>('/routes/comparison');
  }
}
