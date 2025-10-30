using Npgsql;

namespace Shared.DB
{
    public abstract class BaseDB
    {
        private static readonly string _connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION") ?? "";

        protected static NpgsqlConnection GetConnection()
        {
            var conn = new NpgsqlConnection(_connectionString);
            conn.Open();
            return conn;
        }
    }
}
