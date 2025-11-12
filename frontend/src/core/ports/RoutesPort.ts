import { Route, RouteFilters, RouteComparison } from '../domain/route';

export interface RoutesPort {
  getRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparison(): Promise<RouteComparison[]>;
}
