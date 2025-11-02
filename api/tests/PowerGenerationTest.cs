
using Shared.Model;
using Shared.DB;
using GeneratorDaemon.src.GeneratorProcess;
using Shared.Utils;
namespace tests;


[Collection("Sequential")]
public class PowerGeneration
{
    [Fact]
    public async Task Test2()
    {
        TestUtils.TruncateAll();
       
       var users = new List<UserWithGenerators>
                {
                    new(
                        new User(
                            Guid.NewGuid(),
                            "User1",
                            100m,
                            0,
                            DateTime.UtcNow,
                            DateTime.UtcNow
                        ),
                        new UserGenerators(
                            [
                                new("Wind", 1, 25m)
                            ],
                            25m
                        )
                    ),

                    new(
                        new User(
                            Guid.NewGuid(),
                            "User2",
                            200m,
                            0,
                            DateTime.UtcNow,
                            DateTime.UtcNow
                        ),
                        new UserGenerators(
                            [
                                new("Solar", 2, 40m),
                                new("Wind", 1, 25m)
                            ],
                            65m
                        )
                    ),

                    new(
                        new User(
                            Guid.NewGuid(),
                            "User3",
                            300m,
                            0,
                            DateTime.UtcNow,
                            DateTime.UtcNow
                        ),
                        new UserGenerators(
                            [
                                new("Hydro", 1, 40m),
                                new("Solar", 2, 40m),
                                new("Wind", 1, 25m)
                            ],
                            105m
                        )
                    )
        };

        var tasks = users.Select(u => Task.Run(() => UserGeneratorManagement.UpsertUserWithGenerators(u)));
        await Task.WhenAll(tasks);

        Guid user1 = users[0].User.Id;
        Guid user2 = users[1].User.Id;
        Guid user3 = users[2].User.Id;

    

        var usersFromDB = UsersDB.GetUsers();
        var m = usersFromDB.ToDictionary(u => u.Id, u => u.EnergyStored);
        Assert.Equal(0.00m, m[user1]);
        Assert.Equal(0.00m, m[user2]);
        Assert.Equal(0.00m, m[user3]);


        await new GeneratorProcess().RunAsync();
        usersFromDB = UsersDB.GetUsers();
        m = usersFromDB.ToDictionary(u => u.Id, u => u.EnergyStored);
        Assert.Equal(25.00m, m[user1]);
        Assert.Equal(65.00m, m[user2]);
        Assert.Equal(105.00m, m[user3]);

    }
}