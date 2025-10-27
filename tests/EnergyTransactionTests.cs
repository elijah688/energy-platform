using Shared.Model;
using Shared.DB;


namespace tests
{
    [Collection("Sequential")]
    public class EnergyTransactionTests
    {
        [Fact]
        public void TestEnergyTransaction()
        {
            // Clear DB
            TestUtils.TruncateAll();

            // 1️⃣ Create users
            var user1 = new User
            {
                Id = Guid.NewGuid(),
                Name = "Alice",
                Balance = 2000m,
                EnergyStored = 100m
            };
            var user2 = new User
            {
                Id = Guid.NewGuid(),
                Name = "Bob",
                Balance = 1500m,
                EnergyStored = 50m
            };

            DB.UpsertUsers([user1, user2]);

            // 2️⃣ Create generators
            var generators = new List<Generator>
            {
                new() { Id = Guid.NewGuid(), Type = "Wind", ProductionRate = 30m, OwnerId = user1.Id },
                new () { Id = Guid.NewGuid(), Type = "Solar", ProductionRate = 20m, OwnerId = user1.Id },
                new () { Id = Guid.NewGuid(), Type = "Wind", ProductionRate = 40m, OwnerId = user2.Id },
                new () { Id = Guid.NewGuid(), Type = "Solar", ProductionRate = 25m, OwnerId = user2.Id },
                new () { Id = Guid.NewGuid(), Type = "Wind", ProductionRate = 15m, OwnerId = user2.Id }
            };
            DB.UpsertGenerators(generators);

            // 3️⃣ Execute transaction: User1 sells 50 energy units to User2 at price 20 per unit
            var tx = new EnergyTransaction
            {
                SellerId = user1.Id,
                BuyerId = user2.Id,
                EnergyAmount = 50m,
                PricePerKwh = 20m
            };

            // Pre-checks
            Assert.True(user2.Balance >= tx.TotalPrice, "Buyer has enough money");
            Assert.True(user1.EnergyStored >= tx.EnergyAmount, "Seller has enough energy");

            DB.ExecuteEnergyTransaction(tx);

            // 4️⃣ Get updated users from DB
            var usersFromDB = DB.GetUsers().ToDictionary(u => u.Id, u => u);

            var updatedUser1 = usersFromDB[user1.Id];
            var updatedUser2 = usersFromDB[user2.Id];

            // 5️⃣ Assertions
            Assert.Equal(user1.Balance + tx.TotalPrice, updatedUser1.Balance);         // Seller balance increases
            Assert.Equal(user1.EnergyStored - tx.EnergyAmount, updatedUser1.EnergyStored); // Seller energy decreases

            Assert.Equal(user2.Balance - tx.TotalPrice, updatedUser2.Balance);         // Buyer balance decreases
            Assert.Equal(user2.EnergyStored + tx.EnergyAmount, updatedUser2.EnergyStored); // Buyer energy increases
        }
    }
}
