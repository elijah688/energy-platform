export interface GeneratorResponse {
  success: boolean;
  message?: string;
  generator?: EnergyGenerator;
}

export interface UserGeneratorsMap {
  [userId: string]: EnergyGenerator[];
}


// user.model.ts
export interface EnergyGenerator {
  id: string;               // UUID
  type: 'Wind' | 'Solar' | 'Hydro';
  productionRate: number;   // kWh per unit time
  ownerId: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  lastGeneratedAt?: string; // optional ISO timestamp
  createdAt: string;
  updatedAt?: string;
}

// Predefined production rates for each generator type
export const GENERATOR_TYPES = {
  "Wind": { productionRate: 15, label: 'Wind Turbine', icon: '🌬️' },
  "Solar": { productionRate: 8, label: 'Solar Panel', icon: '☀️' },
  "Hydro": { productionRate: 25, label: 'Hydro Generator', icon: '💧' }
} as const;
