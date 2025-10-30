namespace Shared.Model
{

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



    public class UserWithGenerators
    {
        public User User { get; set; } = new();
        public List<Generator> Generators { get; set; } = new();
    }



}