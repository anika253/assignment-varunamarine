import { PoolingPort } from '../../../core/ports/PoolingPort';
import { PoolCreationRequest, PoolCreationResult } from '../../../core/domain/pooling';
import { ApiClient } from './apiClient';

export class PoolingService implements PoolingPort {
  constructor(private client: ApiClient = new ApiClient()) {}

  createPool(payload: PoolCreationRequest): Promise<PoolCreationResult> {
    return this.client.post<PoolCreationResult>('/pools', payload);
  }
}
