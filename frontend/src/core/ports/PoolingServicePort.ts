import { CreatePoolPayload, CreatePoolResponse } from '../domain/Pooling';

export interface PoolingServicePort {
  createPool(payload: CreatePoolPayload): Promise<CreatePoolResponse>;
}
