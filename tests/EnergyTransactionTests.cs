using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Shared.Model;
namespace tests;

public class ServerTests(WebApplicationFactory<TransactionServer.Program> factory) : IClassFixture<WebApplicationFactory<TransactionServer.Program>>
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
    }
}
