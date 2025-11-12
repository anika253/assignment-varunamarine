import { Route } from '../domain/Route';
import { RouteServicePort } from '../ports/RouteServicePort';
import { RouteFilters } from '../domain/Route';

export class FetchRoutes {
  constructor(private routeService: RouteServicePort) {}

  execute(filters?: RouteFilters): Promise<Route[]> {
    return this.routeService.listRoutes(filters);
  }
}
