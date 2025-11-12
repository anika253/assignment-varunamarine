import { RouteComparison, Route } from '../domain/Route';
import { TARGET_INTENSITY_2025 } from '../domain/Compliance';
import { RouteRepository } from '../ports/RouteRepository';

export class GetRouteComparison {
  constructor(private routeRepository: RouteRepository) {}

  async execute(targetIntensity: number = TARGET_INTENSITY_2025): Promise<RouteComparison[]> {
    const baseline = await this.routeRepository.getBaseline();
    if (!baseline) {
      throw new Error('No baseline route found');
    }

    const allRoutes = await this.routeRepository.findAll();
    const comparisons: RouteComparison[] = [];

    for (const route of allRoutes) {
      if (route.routeId === baseline.routeId) {
        continue; // Skip baseline itself
      }

      // Calculate percent difference
      // percentDiff = ((comparison / baseline) - 1) × 100
      const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
      const compliant = route.ghgIntensity <= targetIntensity;

      comparisons.push({
        routeId: route.routeId,
        baseline,
        comparison: route,
        percentDiff,
        compliant,
      });
    }

    return comparisons;
  }
}


