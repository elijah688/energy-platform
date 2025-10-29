
// generator.model.ts
export interface Generator {
  id: string;               // UUID
  type: 'Wind' | 'Solar';
  productionRate: number;
  ownerId: string;
  status: string;
  lastGeneratedAt?: string; // optional ISO timestamp
  createdAt: string;
  updatedAt?: string;
}
