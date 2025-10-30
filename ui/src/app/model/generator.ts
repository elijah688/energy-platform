export interface EnergyGenerator {
  id: string;               // UUID
  type: 'Wind' | 'Solar';
  productionRate: number;   // kWh per unit time
  ownerId: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  lastGeneratedAt?: string; // optional ISO timestamp
  createdAt: string;
  updatedAt?: string;
}

export interface GeneratorResponse {
  success: boolean;
  message?: string;
  generator?: EnergyGenerator;
}

export interface UserGeneratorsMap {
  [userId: string]: EnergyGenerator[];
}
