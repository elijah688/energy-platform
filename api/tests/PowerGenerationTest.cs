
using Shared.Model;
using Shared.DB;
using GeneratorDaemon.src.GeneratorProcess;
using System.Threading.Tasks;
using System.Text.Json.Nodes;
using Shared.Utils;
namespace tests;


[Collection("Sequential")]
public class PowerGeneration
{
    [Fact]
    public async Task Test2()
    {
        TestUtils.TruncateAll();
        var users = new List<User>
            {
                new User
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "User 1",
                    Balance = 100m,
                    EnergyStored = 0m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "User 2",
                    Balance = 150m,
                    EnergyStored = 0m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Name = "User 3",
                    Balance = 200m,
                    EnergyStored = 0m,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

        UsersDB.UpsertUsers(users);

        Guid user1 = users[0].Id;
        Guid user2 = users[1].Id;
        Guid user3 = users[2].Id;

        var generators = new List<Generator> {
                new Generator
                {
                Id = Guid.NewGuid(),
                Type = "Wind",
                ProductionRate = 50.5m,
                OwnerId = user1,
                Status = "active",
                LastGeneratedAt = DateTime.UtcNow.AddHours(-2)
                },
                new Generator
                {
                Id = Guid.NewGuid(),
                Type = "Solar",
                ProductionRate = 30.2m,
                OwnerId = user1,
                Status = "active",
                LastGeneratedAt = DateTime.UtcNow.AddHours(-1)
                },
                new Generator
                {
                Id = Guid.NewGuid(),
                Type = "Wind",
                ProductionRate = 45.0m,
                OwnerId = user2,
                Status = "active",
                LastGeneratedAt = DateTime.UtcNow.AddHours(-3)
                },
                new Generator
                {
                Id = Guid.NewGuid(),
                Type = "Solar",
                ProductionRate = 28.7m,
                OwnerId = user2,
                Status = "inactive",
                LastGeneratedAt = null
                },
                new Generator
                {
                Id = Guid.NewGuid(),
                Type = "Wind",
                ProductionRate = 60.0m,
                OwnerId = user3,
                Status = "active",
                LastGeneratedAt = DateTime.UtcNow.AddHours(-5)
                }
        };

        GeneratorsDB.UpsertGenerators(generators);

        var usersFromDB = UsersDB.GetUsers();
        var m = usersFromDB.ToDictionary(u => u.Id, u => u.EnergyStored);
        Assert.Equal(0.00m, m[user1]);
        Assert.Equal(0.00m, m[user2]);
        Assert.Equal(0.00m, m[user3]);


        await new GeneratorProcess().RunAsync();
        usersFromDB = UsersDB.GetUsers();
        m = usersFromDB.ToDictionary(u => u.Id, u => u.EnergyStored);
        Assert.Equal(80.70m, m[user1]);
        Assert.Equal(73.70m, m[user2]);
        Assert.Equal(60.00m, m[user3]);

    }
}