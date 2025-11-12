import { Pool, PoolMember, PoolCreationRequest, PoolCreationResult } from '../domain/Pooling';

export interface PoolingRepository {
  createPool(pool: Pool): Promise<Pool>;
  addPoolMembers(poolId: number, members: PoolMember[]): Promise<void>;
  getPoolMembers(poolId: number): Promise<PoolMember[]>;
}


