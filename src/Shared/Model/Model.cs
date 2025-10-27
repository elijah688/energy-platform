namespace Shared.Model
{
    public class Generator
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = "";
        public decimal ProductionRate { get; set; }
        public Guid OwnerId { get; set; }
        public string Status { get; set; } = "";
        public DateTime? LastGeneratedAt { get; set; }
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
}