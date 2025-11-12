import { Route, RouteComparison } from '../domain/Route';

export interface RouteRepository {
  findAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]>;
  findById(routeId: string): Promise<Route | null>;
  setBaseline(routeId: string): Promise<void>;
  getBaseline(): Promise<Route | null>;
  getComparison(targetIntensity?: number): Promise<RouteComparison[]>;
}


