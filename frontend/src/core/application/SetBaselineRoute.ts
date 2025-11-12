import { RouteServicePort } from '../ports/RouteServicePort';

export class SetBaselineRoute {
  constructor(private routeService: RouteServicePort) {}

  execute(routeId: string): Promise<void> {
    return this.routeService.setBaseline(routeId);
  }
}
