import { ComplianceBalance, AdjustedComplianceBalance } from '../domain/Compliance';

export interface ComplianceRepository {
  saveComplianceBalance(cb: ComplianceBalance): Promise<void>;
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null>;
  getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null>;
}


