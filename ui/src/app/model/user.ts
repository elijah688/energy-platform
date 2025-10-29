// user.model.ts
export interface User {
  id: string;               // UUID as string
  name: string;
  balance: number;
  energyStored: number;
  createdAt: string;        // ISO timestamp
  updatedAt?: string;       // optional ISO timestamp
}
