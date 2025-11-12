import { CreatePool } from '../../core/application/CreatePool';
import { PoolingRepository } from '../../core/ports/PoolingRepository';
import { Pool, PoolMember, PoolCreationResult } from '../../core/domain/Pooling';

class InMemoryPoolingRepository implements PoolingRepository {
  pools: Pool[] = [];
  members: PoolMember[] = [];

  async createPool(pool: Pool): Promise<Pool> {
    const created: Pool = { ...pool, id: this.pools.length + 1 };
    this.pools.push(created);
    return created;
  }

  async addPoolMembers(poolId: number, members: PoolMember[]): Promise<void> {
    this.members.push(
      ...members.map((member, index) => ({
        ...member,
        id: this.members.length + index + 1,
        poolId,
      }))
    );
  }

  async getPoolMembers(poolId: number): Promise<PoolMember[]> {
    return this.members.filter((m) => m.poolId === poolId);
  }
}

describe('CreatePool', () => {
  it('allocates surplus to deficits while respecting constraints', async () => {
    const repository = new InMemoryPoolingRepository();
    const useCase = new CreatePool(repository);

    const result = await useCase.execute({
      year: 2025,
      members: [
        { shipId: 'S1', cbBefore: 120 },
        { shipId: 'S2', cbBefore: -70 },
        { shipId: 'S3', cbBefore: -30 },
      ],
    });

    expect(result.poolId).toBe(1);

    const allocations = result.members.reduce<Record<string, PoolCreationResult['members'][number]>>((acc, member) => {
      acc[member.shipId] = member;
      return acc;
    }, {});

    expect(allocations['S1'].cbAfter).toBe(20);
    expect(allocations['S2'].cbAfter).toBe(0);
    expect(allocations['S3'].cbAfter).toBe(0);
  });

  it('throws when pool sum is negative', async () => {
    const repository = new InMemoryPoolingRepository();
    const useCase = new CreatePool(repository);

    await expect(
      useCase.execute({
        year: 2025,
        members: [
          { shipId: 'S1', cbBefore: -50 },
          { shipId: 'S2', cbBefore: -20 },
        ],
      })
    ).rejects.toThrow('Pool creation failed');
  });
});
