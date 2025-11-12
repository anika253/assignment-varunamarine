export interface Route {
  id?: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // gCO₂e/MJ
  fuelConsumption: number; // tonnes
  distance: number; // km
  totalEmissions: number; // tonnes
  isBaseline: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RouteComparison {
  routeId: string;
  baseline: Route;
  comparison: Route;
  percentDiff: number;
  compliant: boolean;
}


