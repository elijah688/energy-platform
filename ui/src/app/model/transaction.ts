


export interface EnergyTransaction {
  sellerId: string;
  buyerId: string;
  energyAmount: number;
  pricePerKwh: number;
  totalPrice?: number;
}

export interface TransactionResponse {
  message: string;
  totalPrice: number;
}

export interface UserTransactionsMap {
  [userId: string]: EnergyTransaction[];
}
