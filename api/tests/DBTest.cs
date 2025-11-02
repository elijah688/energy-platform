
using Shared.Model;
using Shared.DB;
namespace tests;

[Collection("Sequential")]
public class DBTest
{
    [Fact]
    public async Task Test1()
    {
        TestUtils.TruncateAll();

        var uidOne = Guid.NewGuid();
        var uidTwo = Guid.NewGuid();
        var uidThree = Guid.NewGuid();
        var users = new List<UserWithGenerators>
                {
                    new(
                        new User(
                            uidOne,
                            "User1",
                            100m,
                            50m,
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
                            uidTwo,
                            "User2",
                            200m,
                            60m,
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
                            uidThree,
                            "User3",
                            300m,
                            80m,
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



        var expected = new Dictionary<Guid, int> { { uidOne, 1 }, { uidTwo, 2 }, { uidThree, 3 } };
        UserWithGenerators?[] actual = await Task.WhenAll(users.Select(u => Task.Run(() => UserGeneratorManagement.GetUserWithGenerators(u.User.Id))));
        Assert.NotNull(actual);

        Assert.Equal(expected.Count, actual.Length);

        foreach (var g in actual)
        {
            Assert.NotNull(g);

            Assert.Equal(expected[g.User.Id], g.Generators.Generators.Count);

        }
    }
}
