// Target intensity for 2025: 89.3368 gCO₂e/MJ (2% below 91.16)
export const TARGET_INTENSITY_2025 = 89.3368;
export const ENERGY_PER_TONNE = 41000; // MJ/t

export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number; // Compliance Balance in gCO₂e
  cbBefore?: number;
  cbAfter?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdjustedComplianceBalance extends ComplianceBalance {
  adjustedCb: number; // CB after bank applications
}


