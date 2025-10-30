namespace Shared.Model
{
    public record EnergyTransaction(
        Guid SellerId,
        Guid BuyerId,
        decimal EnergyAmount,
        decimal PricePerKwh
    )
    {
        // Derived property
        public decimal TotalPrice => EnergyAmount * PricePerKwh;
    }

}
