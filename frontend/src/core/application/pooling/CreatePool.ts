import { PoolingPort } from '../../ports/PoolingPort';
import { PoolCreationRequest, PoolCreationResult } from '../../domain/pooling';

export class CreatePoolUseCase {
  constructor(private poolingPort: PoolingPort) {}

  execute(payload: PoolCreationRequest): Promise<PoolCreationResult> {
    return this.poolingPort.createPool(payload);
  }
}
