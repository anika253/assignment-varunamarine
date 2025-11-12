import { RoutesPort } from '../../ports/RoutesPort';
import { Route, RouteFilters } from '../../domain/route';

export class GetRoutes {
  constructor(private routesPort: RoutesPort) {}

  execute(filters?: RouteFilters): Promise<Route[]> {
    return this.routesPort.getRoutes(filters);
  }
}
