namespace Shared.Model
{
    public class Generator
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = "";
        public decimal ProductionRate { get; set; }
        public Guid OwnerId { get; set; }
        public string Status { get; set; } = "active";
        public DateTime? LastGeneratedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }


    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = "";
        public decimal Balance { get; set; } = 0;
        public decimal EnergyStored { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserEnergyUpdate
    {
        public Guid UserId { get; set; }
        public decimal Energy { get; set; }
    }


    public class EnergyTransaction
    {
        public Guid SellerId { get; set; }
        public Guid BuyerId { get; set; }
        public decimal EnergyAmount { get; set; }
        public decimal PricePerKwh { get; set; }

        // Derived property
        public decimal TotalPrice => EnergyAmount * PricePerKwh;
    }

    public class UserWithGenerators
    {
        public User User { get; set; } = new();
        public List<Generator> Generators { get; set; } = new();
    }

}