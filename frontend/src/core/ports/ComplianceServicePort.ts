import { ComplianceBalance, AdjustedComplianceBalance } from '../domain/Compliance';

export interface ComplianceServicePort {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedComplianceBalances(year: number): Promise<AdjustedComplianceBalance[]>;
}
