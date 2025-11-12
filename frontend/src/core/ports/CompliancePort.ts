import { ComplianceBalance, AdjustedComplianceBalance } from '../domain/compliance';

export interface CompliancePort {
  computeComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance>;
}
