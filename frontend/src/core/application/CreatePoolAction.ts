import { CreatePoolPayload, CreatePoolResponse } from '../domain/Pooling';
import { PoolingServicePort } from '../ports/PoolingServicePort';

export class CreatePoolAction {
  constructor(private poolingService: PoolingServicePort) {}

  execute(payload: CreatePoolPayload): Promise<CreatePoolResponse> {
    return this.poolingService.createPool(payload);
  }
}
