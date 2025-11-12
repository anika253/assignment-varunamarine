import { ComplianceBalance, TARGET_INTENSITY_2025, ENERGY_PER_TONNE } from '../domain/Compliance';
import { Route } from '../domain/Route';
import { ComplianceRepository } from '../ports/ComplianceRepository';
import { RouteRepository } from '../ports/RouteRepository';

export class ComputeComplianceBalance {
  constructor(
    private routeRepository: RouteRepository,
    private complianceRepository: ComplianceRepository
  ) {}

  async execute(shipId: string, year: number): Promise<ComplianceBalance> {
    // Get route data for the ship
    const route = await this.routeRepository.findById(shipId);
    if (!route) {
      throw new Error(`Route not found for shipId: ${shipId}`);
    }

    // Calculate Compliance Balance
    // CB = (Target - Actual) × Energy in scope
    // Energy in scope = fuelConsumption × 41000 MJ/t
    const targetIntensity = TARGET_INTENSITY_2025;
    const actualIntensity = route.ghgIntensity;
    const energyInScope = route.fuelConsumption * ENERGY_PER_TONNE;
    const cbGco2eq = (targetIntensity - actualIntensity) * energyInScope;

    const complianceBalance: ComplianceBalance = {
      shipId,
      year,
      cbGco2eq,
    };

    // Save to repository
    await this.complianceRepository.saveComplianceBalance(complianceBalance);

    return complianceBalance;
  }
}


