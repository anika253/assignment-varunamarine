import { httpRequest, HttpError } from '../../../shared/http';
import { ComplianceBalance, AdjustedComplianceBalance } from '../../../core/domain/Compliance';
import { ComplianceServicePort } from '../../../core/ports/ComplianceServicePort';
import { RouteServicePort } from '../../../core/ports/RouteServicePort';

export class ComplianceHttpService implements ComplianceServicePort {
  constructor(private routeService: RouteServicePort) {}

  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    const query = new URLSearchParams({ shipId, year: String(year) }).toString();
    return httpRequest<ComplianceBalance>(`/compliance/cb?${query}`);
  }

  async getAdjustedComplianceBalances(year: number): Promise<AdjustedComplianceBalance[]> {
    const query = new URLSearchParams({ year: String(year) }).toString();
    try {
      return await httpRequest<AdjustedComplianceBalance[]>(`/compliance/adjusted-cb?${query}`);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        // Fallback: compute on the fly using available routes.
        const routes = await this.routeService.listRoutes({ year });
        const balances = await Promise.all(
          routes.map(async (route) => {
            const cb = await this.getComplianceBalance(route.routeId, year);
            return {
              shipId: route.routeId,
              year: cb.year,
              cbGco2eq: cb.cbGco2eq,
              adjustedCb: cb.cbGco2eq,
            } satisfies AdjustedComplianceBalance;
          })
        );
        return balances;
      }
      throw error;
    }
  }
}
