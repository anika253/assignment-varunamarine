import { CompliancePort } from '../../ports/CompliancePort';
import { AdjustedComplianceBalance } from '../../domain/compliance';

export class GetAdjustedComplianceBalance {
  constructor(private compliancePort: CompliancePort) {}

  execute(shipId: string, year: number): Promise<AdjustedComplianceBalance> {
    return this.compliancePort.getAdjustedComplianceBalance(shipId, year);
  }
}
