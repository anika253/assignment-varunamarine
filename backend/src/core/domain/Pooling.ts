export interface Pool {
  id?: number;
  year: number;
  createdAt?: Date;
}

export interface PoolMember {
  id?: number;
  poolId: number;
  shipId: string;
  cbBefore: number;
  cbAfter: number;
  createdAt?: Date;
}

export interface PoolCreationRequest {
  year: number;
  members: Array<{
    shipId: string;
    cbBefore: number;
  }>;
}

export interface PoolCreationResult {
  poolId: number;
  members: Array<{
    shipId: string;
    cbBefore: number;
    cbAfter: number;
  }>;
}


