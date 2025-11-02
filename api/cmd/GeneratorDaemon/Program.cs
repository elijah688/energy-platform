using GeneratorDaemon.src.GeneratorProcess;

namespace GeneratorDaemon
{
    public class Program
    {
        public static async Task Main(string[] args)
        {

            while (true)
            {
                var gp = new GeneratorProcess();

                await gp.RunAsync();
                await Task.Delay(TimeSpan.FromSeconds(2));

            }

        }

    }
}
