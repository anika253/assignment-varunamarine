import { RoutesPort } from '../../ports/RoutesPort';
import { RouteComparison } from '../../domain/route';

export class GetRouteComparison {
  constructor(private routesPort: RoutesPort) {}

  execute(): Promise<RouteComparison[]> {
    return this.routesPort.getComparison();
  }
}
