using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Shared.Model;
using Shared.DB;

namespace tests;

[Collection("Sequential")]
public class ServerTests(WebApplicationFactory<TransactionServer.Program> factory)
    : IClassFixture<WebApplicationFactory<TransactionServer.Program>>
{
    private readonly WebApplicationFactory<TransactionServer.Program> _factory = factory;

    [Fact]
    public async Task TestEnergyTransactionEndpoint()
    {
        TestUtils.TruncateAll();

        var client = _factory.CreateClient();

        // 1️⃣ Create users
        var users = new List<UserWithGenerators>
            {
                new(
                    new User(
                        Guid.NewGuid(),
                        "Alice",
                        100m,
                        50m,
                        DateTime.UtcNow,
                        DateTime.UtcNow
                    ),
                    new UserGenerators(
                        [
                            new("Wind", 1, 30m)
                        ],
                        30m
                    )
                ),
                new(
                    new User(
                        Guid.NewGuid(),
                        "Bob",
                        200m,
                        70m,
                        DateTime.UtcNow,
                        DateTime.UtcNow
                    ),
                    new UserGenerators(
                        [
                            new("Solar", 1, 25m)
                        ],
                        25m
                    )
                )
            };

        var tasks = users.Select(u => Task.Run(async () =>
               {
                   var usersResponse = await client.PostAsJsonAsync("/users/upsert", u);
                   usersResponse.EnsureSuccessStatusCode();


               })
        );

        await Task.WhenAll(tasks);

        // 🔹 Check DB before transaction
        var usersFromDbBefore = UsersDB.GetUsers().ToDictionary(u => u.Id, u => u);
        var aliceBefore = usersFromDbBefore[users[0].User.Id];
        var bobBefore = usersFromDbBefore[users[1].User.Id];

        Assert.Equal(100m, aliceBefore.Balance);
        Assert.Equal(50m, aliceBefore.EnergyStored);
        Assert.Equal(200m, bobBefore.Balance);
        Assert.Equal(70m, bobBefore.EnergyStored);

        // 2️⃣ Execute a transaction
        var tx = new EnergyTransaction
        (
          users[0].User.Id,
           users[1].User.Id,
           20m,
           5m
        );

        var txResponse = await client.PostAsJsonAsync("/transaction", tx);
        txResponse.EnsureSuccessStatusCode();

        var txResult = await txResponse.Content.ReadAsStringAsync();
        Assert.Contains("Transaction completed", txResult);

        // 🔹 Check DB after transaction
        var usersFromDbAfter = UsersDB.GetUsers().ToDictionary(u => u.Id, u => u);
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
