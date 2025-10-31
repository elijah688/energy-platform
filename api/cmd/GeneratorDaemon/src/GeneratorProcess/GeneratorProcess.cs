// using System.Threading.Channels;
// using Shared.Model;
// using Shared.DB;
// using Shared.Utils;

// namespace GeneratorDaemon.src.GeneratorProcess
// {
//     public class GeneratorProcess()
//     {
//         private readonly Channel<List<UserEnergyUpdate>> _channel = Channel.CreateUnbounded<List<UserEnergyUpdate>>();

//         public async Task RunAsync()
//         {
//             var producer = Task.Run(async () =>
//             {

//                 int limit = int.TryParse(Environment.GetEnvironmentVariable("LIMIT"), out int temp) ? temp : 100;
//                 int offset = 0;

//                 while (true)
//                 {
//                     var generators = GeneratorsDB.GetGenerators(limit, offset);
//                     if (generators.Count == 0)
//                     {
//                         _channel.Writer.Complete();
//                         return;
//                     }

//                     var updates = generators
//                        .GroupBy(g => g.OwnerId)
//                        .Select(g => new UserEnergyUpdate
//                        {
//                            UserId = g.Key,
//                            Energy = g.Sum(gen => gen.ProductionRate)
//                        })
//                        .ToList();
//                     await _channel.Writer.WriteAsync(updates);


//                     offset += limit;

//                 }

//             });

//             var consumer = Task.Run(async () =>
//             {
//                 await foreach (var energyUpdates in _channel.Reader.ReadAllAsync())
//                 {
//                     UsersDB.UpdateUsersEnergyStore(energyUpdates);
//                 }
//             });

//             await Task.WhenAll(producer, consumer);
//         }
//     }
// }
