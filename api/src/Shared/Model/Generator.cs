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

    public class UserGeneratorsMap : Dictionary<Guid, List<Generator>> { }


}