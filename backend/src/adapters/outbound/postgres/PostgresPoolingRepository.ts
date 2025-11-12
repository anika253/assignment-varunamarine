import { Pool as DbPool } from 'pg';
import { Pool, PoolMember } from '../../../core/domain/Pooling';
import { PoolingRepository } from '../../../core/ports/PoolingRepository';

export class PostgresPoolingRepository implements PoolingRepository {
  constructor(private db: DbPool) {}

  async createPool(pool: Pool): Promise<Pool> {
    const result = await this.db.query(
      'INSERT INTO pools (year) VALUES ($1) RETURNING *',
      [pool.year]
    );
    return this.mapRowToPool(result.rows[0]);
  }

  async addPoolMembers(poolId: number, members: PoolMember[]): Promise<void> {
    for (const member of members) {
      await this.db.query(
        `INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after)
         VALUES ($1, $2, $3, $4)`,
        [poolId, member.shipId, member.cbBefore, member.cbAfter]
      );
    }
  }

  async getPoolMembers(poolId: number): Promise<PoolMember[]> {
    const result = await this.db.query(
      'SELECT * FROM pool_members WHERE pool_id = $1',
      [poolId]
    );
    return result.rows.map(this.mapRowToPoolMember);
  }

  private mapRowToPool(row: any): Pool {
    return {
      id: row.id,
      year: row.year,
      createdAt: row.created_at,
    };
  }

  private mapRowToPoolMember(row: any): PoolMember {
    return {
      id: row.id,
      poolId: row.pool_id,
      shipId: row.ship_id,
      cbBefore: parseFloat(row.cb_before),
      cbAfter: parseFloat(row.cb_after),
      createdAt: row.created_at,
    };
  }
}


