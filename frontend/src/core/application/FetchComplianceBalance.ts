import { ComplianceBalance } from '../domain/Compliance';
import { ComplianceServicePort } from '../ports/ComplianceServicePort';

export class FetchComplianceBalance {
  constructor(private complianceService: ComplianceServicePort) {}

  execute(shipId: string, year: number): Promise<ComplianceBalance> {
    return this.complianceService.getComplianceBalance(shipId, year);
  }
}
