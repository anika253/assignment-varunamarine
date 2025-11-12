import { Route, RouteFilters, RouteComparisonRow } from '../domain/Route';

export interface RouteServicePort {
  listRoutes(filters?: RouteFilters): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;
  getComparisons(): Promise<RouteComparisonRow[]>;
}
