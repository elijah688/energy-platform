using System.Text.Json.Serialization;

namespace Shared.Model
{

    public record User(
       [property: JsonPropertyName("id")] Guid Id,
       [property: JsonPropertyName("name")] string Name,
       [property: JsonPropertyName("balance")] decimal Balance,
       [property: JsonPropertyName("energyStored")] decimal EnergyStored,
       [property: JsonPropertyName("createdAt")] DateTime CreatedAt,
       [property: JsonPropertyName("updatedAt")] DateTime UpdatedAt
   )
    {
        public User() : this(
            Guid.NewGuid(),
            string.Empty,
            0,
            0,
            DateTime.UtcNow,
            DateTime.UtcNow
        )
        { }
    }

    public class UserEnergyUpdate
    {
        public Guid UserId { get; set; }
        public decimal Energy { get; set; }
    }






}