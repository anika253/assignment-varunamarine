import { PoolCreationRequest, PoolCreationResult, PoolMember } from '../domain/Pooling';
import { PoolingRepository } from '../ports/PoolingRepository';

export class CreatePool {
  constructor(private poolingRepository: PoolingRepository) {}

  async execute(request: PoolCreationRequest): Promise<PoolCreationResult> {
    // Validate: Sum of adjusted CBs must be >= 0
    const totalCb = request.members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCb < 0) {
      throw new Error('Pool creation failed: Sum of compliance balances must be >= 0');
    }

    // Initialize allocations map
    const allocationsMap = new Map<string, { shipId: string; cbBefore: number; cbAfter: number }>();
    request.members.forEach((m) => {
      allocationsMap.set(m.shipId, { shipId: m.shipId, cbBefore: m.cbBefore, cbAfter: m.cbBefore });
    });

    // Separate surpluses and deficits
    const surpluses = request.members.filter((m) => m.cbBefore > 0).sort((a, b) => b.cbBefore - a.cbBefore);
    const deficits = request.members.filter((m) => m.cbBefore < 0).sort((a, b) => a.cbBefore - b.cbBefore);

    // Greedy allocation: transfer from surpluses to deficits
    let surplusIdx = 0;
    let deficitIdx = 0;

    while (surplusIdx < surpluses.length && deficitIdx < deficits.length) {
      const surplus = surpluses[surplusIdx];
      const deficit = deficits[deficitIdx];

      const surplusAlloc = allocationsMap.get(surplus.shipId)!;
      const deficitAlloc = allocationsMap.get(deficit.shipId)!;

      if (surplusAlloc.cbAfter <= 0 || deficitAlloc.cbAfter >= 0) {
        break;
      }

      const transferAmount = Math.min(surplusAlloc.cbAfter, Math.abs(deficitAlloc.cbAfter));

      // Validate constraints
      const newSurplusAfter = surplusAlloc.cbAfter - transferAmount;
      const newDeficitAfter = deficitAlloc.cbAfter + transferAmount;

      if (newSurplusAfter < 0) {
        throw new Error('Pool creation failed: Surplus ship would exit negative');
      }
      if (newDeficitAfter < deficitAlloc.cbBefore) {
        throw new Error('Pool creation failed: Deficit ship would exit worse');
      }

      // Apply transfer
      surplusAlloc.cbAfter = newSurplusAfter;
      deficitAlloc.cbAfter = newDeficitAfter;

      // Move indices
      if (surplusAlloc.cbAfter <= 0) {
        surplusIdx++;
      }
      if (deficitAlloc.cbAfter >= 0) {
        deficitIdx++;
      }
    }

    const allocations = Array.from(allocationsMap.values());

    // Create pool
    const pool = await this.poolingRepository.createPool({
      year: request.year,
    });

    // Save pool members
    const poolMembers: PoolMember[] = allocations.map((alloc) => ({
      poolId: pool.id!,
      shipId: alloc.shipId,
      cbBefore: alloc.cbBefore,
      cbAfter: alloc.cbAfter,
    }));

    await this.poolingRepository.addPoolMembers(pool.id!, poolMembers);

    return {
      poolId: pool.id!,
      members: allocations,
    };
  }
}

