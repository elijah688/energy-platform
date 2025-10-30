


interface EnergyTransaction {
  sellerId: string;
  buyerId: string;
  energyAmount: number;
  pricePerKwh: number;
  totalPrice?: number;
}

interface TransactionResponse {
  message: string;
  totalPrice: number;
}
