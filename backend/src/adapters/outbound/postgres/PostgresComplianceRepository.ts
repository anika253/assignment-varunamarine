import { Pool } from 'pg';
import { ComplianceBalance, AdjustedComplianceBalance } from '../../../core/domain/Compliance';
import { ComplianceRepository } from '../../../core/ports/ComplianceRepository';
import { BankingRepository } from '../../../core/ports/BankingRepository';

export class PostgresComplianceRepository implements ComplianceRepository {
  constructor(
    private db: Pool,
    private bankingRepository: BankingRepository
  ) {}

  async saveComplianceBalance(cb: ComplianceBalance): Promise<void> {
    await this.db.query(
      `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
       VALUES ($1, $2, $3)
       ON CONFLICT (ship_id, year) 
       DO UPDATE SET cb_gco2eq = $3, updated_at = CURRENT_TIMESTAMP`,
      [cb.shipId, cb.year, cb.cbGco2eq]
    );
  }

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance | null> {
    const result = await this.db.query(
      'SELECT * FROM ship_compliance WHERE ship_id = $1 AND year = $2',
      [shipId, year]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToComplianceBalance(result.rows[0]);
  }

  async getAdjustedComplianceBalance(shipId: string, year: number): Promise<AdjustedComplianceBalance | null> {
    const cb = await this.getComplianceBalance(shipId, year);
    if (!cb) {
      return null;
    }

    // Get banked amount applied
    const bankedAmount = await this.bankingRepository.getBankedAmount(shipId, year);
    const adjustedCb = cb.cbGco2eq + bankedAmount;

    return {
      ...cb,
      adjustedCb,
    };
  }

  private mapRowToComplianceBalance(row: any): ComplianceBalance {
    return {
      shipId: row.ship_id,
      year: row.year,
      cbGco2eq: parseFloat(row.cb_gco2eq),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}


