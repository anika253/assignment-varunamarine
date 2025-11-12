import { CompliancePort } from '../../../core/ports/CompliancePort';
import { ComplianceBalance, AdjustedComplianceBalance } from '../../../core/domain/compliance';
import { ApiClient } from './apiClient';

export class ComplianceService implements CompliancePort {
  constructor(private client: ApiClient = new ApiClient()) {}

  computeComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    return this.client.get<ComplianceBalance>('/compliance/cb', { shipId, year });
  }

  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance> {
    return this.client.get<AdjustedComplianceBalance>('/compliance/adjusted-cb', { shipId, year });
  }
}
