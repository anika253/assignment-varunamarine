import { Pool } from 'pg';
import { BankEntry } from '../../../core/domain/Banking';
import { BankingRepository } from '../../../core/ports/BankingRepository';

export class PostgresBankingRepository implements BankingRepository {
  constructor(private db: Pool) {}

  async saveBankEntry(entry: BankEntry): Promise<void> {
    await this.db.query(
      `INSERT INTO bank_entries (ship_id, year, amount_gco2eq)
       VALUES ($1, $2, $3)`,
      [entry.shipId, entry.year, entry.amountGco2eq]
    );
  }

  async getBankedAmount(shipId: string, year: number): Promise<number> {
    const result = await this.db.query(
      `SELECT COALESCE(SUM(amount_gco2eq), 0) as total
       FROM bank_entries
       WHERE ship_id = $1 AND year = $2`,
      [shipId, year]
    );
    return parseFloat(result.rows[0].total);
  }

  async getAllBankEntries(shipId: string, year: number): Promise<BankEntry[]> {
    const result = await this.db.query(
      'SELECT * FROM bank_entries WHERE ship_id = $1 AND year = $2 ORDER BY created_at',
      [shipId, year]
    );
    return result.rows.map(this.mapRowToBankEntry);
  }

  private mapRowToBankEntry(row: any): BankEntry {
    return {
      id: row.id,
      shipId: row.ship_id,
      year: row.year,
      amountGco2eq: parseFloat(row.amount_gco2eq),
      createdAt: row.created_at,
    };
  }
}


