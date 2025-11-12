import { PoolCreationRequest, PoolCreationResult } from '../domain/pooling';

export interface PoolingPort {
  createPool(payload: PoolCreationRequest): Promise<PoolCreationResult>;
}
