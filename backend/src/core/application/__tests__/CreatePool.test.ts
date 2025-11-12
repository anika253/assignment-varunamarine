import { CreatePool } from '../CreatePool';
import { PoolingRepository } from '../../ports/PoolingRepository';
import { Pool, PoolMember, PoolCreationResult } from '../../domain/Pooling';

class InMemoryPoolingRepository implements PoolingRepository {
  public createdPools: Pool[] = [];
  public members: PoolMember[] = [];
  private idCounter = 1;

  async createPool(pool: Pool): Promise<Pool> {
    const created = { ...pool, id: this.idCounter++ };
    this.createdPools.push(created);
    return created;
  }

  async addPoolMembers(poolId: number, members: PoolMember[]): Promise<void> {
    this.members.push(...members.map((member) => ({ ...member, poolId })));
  }

  async getPoolMembers(): Promise<PoolMember[]> {
    return this.members;
  }
}

describe('CreatePool', () => {
  it('allocates surplus to cover deficits without violating constraints', async () => {
    const repository = new InMemoryPoolingRepository();
    const useCase = new CreatePool(repository);

    const result: PoolCreationResult = await useCase.execute({
      year: 2025,
      members: [
        { shipId: 'SURPLUS1', cbBefore: 500 },
        { shipId: 'SURPLUS2', cbBefore: 300 },
        { shipId: 'DEFICIT1', cbBefore: -400 },
        { shipId: 'DEFICIT2', cbBefore: -200 },
      ],
    });

    const surplusMembers = result.members.filter((member) => member.cbBefore > 0);
    const deficitMembers = result.members.filter((member) => member.cbBefore < 0);

    surplusMembers.forEach((member) => {
      expect(member.cbAfter).toBeGreaterThanOrEqual(0);
      expect(member.cbAfter).toBeLessThanOrEqual(member.cbBefore);
    });

    deficitMembers.forEach((member) => {
      expect(member.cbAfter).toBeGreaterThanOrEqual(0);
      expect(member.cbAfter).toBeGreaterThanOrEqual(member.cbBefore);
    });
  });

  it('rejects pools where total balance is negative', async () => {
    const repository = new InMemoryPoolingRepository();
    const useCase = new CreatePool(repository);

    await expect(
      useCase.execute({
        year: 2025,
        members: [
          { shipId: 'SURPLUS', cbBefore: 100 },
          { shipId: 'DEFICIT', cbBefore: -300 },
        ],
      })
    ).rejects.toThrow('Pool creation failed: Sum of compliance balances must be >= 0');
  });

  it('ensures deficit ships do not exit worse after pooling', async () => {
    const repository = new InMemoryPoolingRepository();
    const useCase = new CreatePool(repository);

    const result = await useCase.execute({
      year: 2025,
      members: [
        { shipId: 'SURPLUS', cbBefore: 200 },
        { shipId: 'DEFICIT1', cbBefore: -120 },
        { shipId: 'DEFICIT2', cbBefore: -80 },
      ],
    });

    result.members
      .filter((member) => member.cbBefore < 0)
      .forEach((member) => {
        expect(member.cbAfter).toBeGreaterThanOrEqual(member.cbBefore);
      });
  });
});
