export interface PoolMemberInput {
  shipId: string;
  cbBefore: number;
}

export interface PoolMemberResult extends PoolMemberInput {
  cbAfter: number;
}

export interface PoolCreationRequest {
  year: number;
  members: PoolMemberInput[];
}

export interface PoolCreationResult {
  poolId: number;
  members: PoolMemberResult[];
}
