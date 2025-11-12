import { RoutesPort } from '../../../core/ports/RoutesPort';
import { Route, RouteFilters, RouteComparison } from '../../../core/domain/route';
import { ApiClient } from './apiClient';

export class RoutesService implements RoutesPort {
  constructor(private client: ApiClient = new ApiClient()) {}

  getRoutes(filters?: RouteFilters): Promise<Route[]> {
    return this.client.get<Route[]>('/routes', {
      vesselType: filters?.vesselType,
      fuelType: filters?.fuelType,
      year: filters?.year,
    });
  }

  async setBaseline(routeId: string): Promise<void> {
    await this.client.post<{ message: string }>(`/routes/${routeId}/baseline`);
  }

  getComparison(): Promise<RouteComparison[]> {
    return this.client.get<RouteComparison[]>('/routes/comparison');
  }
}
