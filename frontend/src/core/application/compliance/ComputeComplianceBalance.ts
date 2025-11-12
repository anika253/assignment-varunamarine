import { CompliancePort } from '../../ports/CompliancePort';
import { ComplianceBalance } from '../../domain/compliance';

export class ComputeComplianceBalance {
  constructor(private compliancePort: CompliancePort) {}

  execute(shipId: string, year: number): Promise<ComplianceBalance> {
    return this.compliancePort.computeComplianceBalance(shipId, year);
  }
}
