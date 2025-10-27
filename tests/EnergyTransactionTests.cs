using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Shared.Model;
using Shared.DB;

namespace tests;

public class ServerTests(WebApplicationFactory<TransactionServer.Program> factory) 
    : IClassFixture<WebApplicationFactory<TransactionServer.Program>>
{
    private readonly WebApplicationFactory<TransactionServer.Program> _factory = factory;

    [Fact]
    public async Task TestEnergyTransactionEndpoint()
    {
        var client = _factory.CreateClient();

        // 1️⃣ Create users
        var users = new List<UserWithGenerators>
        {
            new ()
            {
                User = new User { Name = "Alice", Balance = 100m, EnergyStored = 50m },
                Generators =
                [
                    new () { Type = "Wind", ProductionRate = 30m }
                ]
            },
            new ()
            {
                User = new User { Name = "Bob", Balance = 200m, EnergyStored = 70m },
                Generators =
                {
                    new () { Type = "Solar", ProductionRate = 25m }
                }
            }
        };

        var usersResponse = await client.PostAsJsonAsync("/users", users);
        usersResponse.EnsureSuccessStatusCode();

        // 🔹 Check DB before transaction
        var usersFromDbBefore = DB.GetUsers().ToDictionary(u => u.Id, u => u);
        var aliceBefore = usersFromDbBefore[users[0].User.Id];
        var bobBefore = usersFromDbBefore[users[1].User.Id];

        Assert.Equal(100m, aliceBefore.Balance);
        Assert.Equal(50m, aliceBefore.EnergyStored);
        Assert.Equal(200m, bobBefore.Balance);
        Assert.Equal(70m, bobBefore.EnergyStored);

        // 2️⃣ Execute a transaction
        var tx = new EnergyTransaction
        {
            SellerId = users[0].User.Id,
            BuyerId = users[1].User.Id,
            EnergyAmount = 20m,
            PricePerKwh = 5m
        };

        var txResponse = await client.PostAsJsonAsync("/transaction", tx);
        txResponse.EnsureSuccessStatusCode();

        var txResult = await txResponse.Content.ReadAsStringAsync();
        Assert.Contains("Transaction completed", txResult);

        // 🔹 Check DB after transaction
        var usersFromDbAfter = DB.GetUsers().ToDictionary(u => u.Id, u => u);
        var aliceAfter = usersFromDbAfter[users[0].User.Id];
        var bobAfter = usersFromDbAfter[users[1].User.Id];

        // Seller: Alice
        Assert.Equal(aliceBefore.Balance + tx.TotalPrice, aliceAfter.Balance);
        Assert.Equal(aliceBefore.EnergyStored - tx.EnergyAmount, aliceAfter.EnergyStored);

        // Buyer: Bob
        Assert.Equal(bobBefore.Balance - tx.TotalPrice, bobAfter.Balance);
        Assert.Equal(bobBefore.EnergyStored + tx.EnergyAmount, bobAfter.EnergyStored);
    }
}
