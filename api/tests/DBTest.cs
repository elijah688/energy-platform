
// using Shared.Model;
// using Shared.DB;
// namespace tests;

// [Collection("Sequential")]
// public class DBTest
// {
//     [Fact]
//     public void Test1()
//     {
//         TestUtils.TruncateAll();

//         var ownerId = Guid.Parse("5a529b31-7e7c-49da-b377-e2bc8bb8da0f");

//         var generators = new List<Generator>{
//             new() {
//                 Id = Guid.Parse("0e1dea3c-990e-43d7-abf3-9ea174367908"),
//                 Type = "Solar",
//                 ProductionRate = 100.5m,
//                 OwnerId = ownerId,
//                 Status = "Active",
//                 LastGeneratedAt = DateTime.UtcNow
//             },
//             new ()
//             {
//                 Id = Guid.Parse("6fe2763e-8780-4b39-b6ad-ae8b67bafd61"),
//                 Type = "Wind",
//                 ProductionRate = 75.3m,
//                 OwnerId = ownerId,
//                 Status = "Active",
//                 LastGeneratedAt = DateTime.UtcNow
//             },
//             new ()
//             {
//                 Id = Guid.Parse("e67046f4-9953-42ae-8c42-448bdfb01d70"),
//                 Type = "Hydro",
//                 ProductionRate = 120.0m,
//                 OwnerId = ownerId,
//                 Status = "Inactive",
//                 LastGeneratedAt = null
//             }
//         };


//         var user = new User
//         {
//             Id = ownerId,
//             Name = "Alice",
//             Balance = 100.0m,
//             EnergyStored = 50.0m,
//         };

//         UsersDB.UpsertUsers([user]);
//         GeneratorsDB.UpsertGenerators(generators);
//         var res = GeneratorsDB.GetGenerators();


//         for (int i = 0; i < res.Count; i++)
//         {
//             var expected = res[i];
//             var actual = generators[i];

//             Assert.Equal(expected.Id, actual.Id);
//             Assert.Equal(expected.Type, actual.Type);
//             Assert.True(Math.Abs(expected.ProductionRate - actual.ProductionRate) < 0.01m, $"Mismatch at index {i} on ProductionRate");
//             Assert.Equal(expected.OwnerId, actual.OwnerId);
//             Assert.Equal(expected.Status, actual.Status);
//             Assert.Equal(expected.LastGeneratedAt?.ToUniversalTime(), actual.LastGeneratedAt?.ToUniversalTime());
//         }

//     }
// }
