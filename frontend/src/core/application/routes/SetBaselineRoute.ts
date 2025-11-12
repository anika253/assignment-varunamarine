import { RoutesPort } from '../../ports/RoutesPort';

export class SetBaselineRoute {
  constructor(private routesPort: RoutesPort) {}

  execute(routeId: string): Promise<void> {
    return this.routesPort.setBaseline(routeId);
  }
}
