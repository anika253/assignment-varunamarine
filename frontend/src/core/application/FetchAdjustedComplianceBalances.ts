import { AdjustedComplianceBalance } from '../domain/Compliance';
import { ComplianceServicePort } from '../ports/ComplianceServicePort';

export class FetchAdjustedComplianceBalances {
  constructor(private complianceService: ComplianceServicePort) {}

  execute(year: number): Promise<AdjustedComplianceBalance[]> {
    return this.complianceService.getAdjustedComplianceBalances(year);
  }
}
