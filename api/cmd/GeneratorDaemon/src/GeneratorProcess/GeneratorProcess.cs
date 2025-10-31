using System.Threading.Channels;
using Shared.Model;
using Shared.DB;

namespace GeneratorDaemon.src.GeneratorProcess
{
    public class GeneratorProcess()
    {
        private readonly Channel<List<UserEnergyUpdate>> _channel = Channel.CreateUnbounded<List<UserEnergyUpdate>>();

        public async Task RunAsync()
        {
            var producer = Task.Run(async () =>
            {

                int limit = int.TryParse(Environment.GetEnvironmentVariable("LIMIT"), out int temp) ? temp : 100;
                int offset = 0;

                while (true)
                {

                    var users = UsersDB.GetUsers(limit, offset);
                    if (users.Count == 0)
                    {
                        _channel.Writer.Complete();
                        return;
                    }

                    var tasks = users.Select(user =>
                        Task.Run(() =>
                        {
                            var gen = GeneratorsDB.GetGenerators(user.Id);
                            return new { user.Id, gen.TotalKwh };
                        })
                    );

                    var results = await Task.WhenAll(tasks);

                    var updates = results
                        .Where(r => r.TotalKwh > 0)
                        .Select(r => new UserEnergyUpdate(r.Id, r.TotalKwh))
                        .ToList();


                    await _channel.Writer.WriteAsync(updates);

                    offset += limit;

                }

            });

            var consumer = Task.Run(async () =>
            {
                await foreach (var energyUpdates in _channel.Reader.ReadAllAsync())
                {
                    UsersDB.UpdateUsersEnergyStore(energyUpdates);
                }
            });

            await Task.WhenAll(producer, consumer);
        }
    }
}
