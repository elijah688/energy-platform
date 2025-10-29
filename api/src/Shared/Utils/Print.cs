using System;
using System.Text.Json;

namespace Shared.Utils
{
    public static class Print
    {
        public static void Prt(object obj)
        {
            var json = JsonSerializer.Serialize(obj, new JsonSerializerOptions
            {
                WriteIndented = true
            });
            Console.WriteLine(json);
        }
    }
}
