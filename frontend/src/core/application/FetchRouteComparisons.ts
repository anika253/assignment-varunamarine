import { RouteComparisonRow } from '../domain/Route';
import { RouteServicePort } from '../ports/RouteServicePort';

export class FetchRouteComparisons {
  constructor(private routeService: RouteServicePort) {}

  execute(): Promise<RouteComparisonRow[]> {
    return this.routeService.getComparisons();
  }
}
