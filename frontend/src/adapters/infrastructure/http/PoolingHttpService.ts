import { httpRequest } from '../../../shared/http';
import { PoolingServicePort } from '../../../core/ports/PoolingServicePort';
import { CreatePoolPayload, CreatePoolResponse } from '../../../core/domain/Pooling';

export class PoolingHttpService implements PoolingServicePort {
  createPool(payload: CreatePoolPayload): Promise<CreatePoolResponse> {
    return httpRequest<CreatePoolResponse>('/pools', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
