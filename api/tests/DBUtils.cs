
using Shared.Model;
using Npgsql;

namespace tests
{

    public class TestUtils
    {

        private static readonly string _connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION") ?? "";


        private static NpgsqlConnection GetConnection()
        {
            var conn = new NpgsqlConnection(_connectionString);
            conn.Open();
            return conn;
        }


        public static void TruncateAll()
        {
            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();
            using var cmd = new NpgsqlCommand
            {
                Connection = conn,
                Transaction = tran
            };

            cmd.CommandText = @"
                TRUNCATE TABLE transactions cascade;
                TRUNCATE TABLE user_generators cascade;
                TRUNCATE TABLE users cascade;
            ";

            cmd.ExecuteNonQuery();
            tran.Commit();
        }


    }
}

