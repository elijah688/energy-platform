
using Shared.Model;
using Npgsql;

namespace Shared.DB
{

    public class DB
    {
        private static readonly string _connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION") ?? "";


        private static Npgsql.NpgsqlConnection GetConnection()
        {
            var conn = new NpgsqlConnection(_connectionString);
            conn.Open();
            return conn;
        }

        public static List<Generator> GetGeneratorsByOwner(Guid ownerId, int limit = 100, int offset = 0)
        {
            var generators = new List<Generator>();

            using var conn = GetConnection();
            using var cmd = new NpgsqlCommand(
                "SELECT id, type, production_rate, owner_id, status, last_generated_at " +
                "FROM generators WHERE owner_id = @ownerId " +
                "ORDER BY id " +
                "LIMIT @limit OFFSET @offset", conn
            );
            cmd.Parameters.AddWithValue("ownerId", ownerId);
            cmd.Parameters.AddWithValue("limit", limit);
            cmd.Parameters.AddWithValue("offset", offset);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                generators.Add(new Generator
                {
                    Id = reader.GetGuid(0),
                    Type = reader.GetString(1),
                    ProductionRate = reader.GetDecimal(2),
                    OwnerId = reader.GetGuid(3),
                    Status = reader.GetString(4),
                    LastGeneratedAt = reader.IsDBNull(5) ? null : reader.GetDateTime(5)
                });
            }

            return generators;
        }

        public static void AddGenerators(List<Generator> generators)
        {
            if (generators.Count == 0) return;

            using var conn = GetConnection();
            using var tran = conn.BeginTransaction(); // wrap in transaction for safety
            using var cmd = new NpgsqlCommand
            {
                Connection = conn,
                Transaction = tran
            };

            cmd.CommandText = @"
        INSERT INTO generators (id, type, production_rate, owner_id, status, last_generated_at)
        VALUES (@id, @type, @rate, @ownerId, @status, @lastGeneratedAt)
    ";

            foreach (var gen in generators)
            {
                cmd.Parameters.Clear();
                cmd.Parameters.AddWithValue("id", gen.Id);
                cmd.Parameters.AddWithValue("type", gen.Type);
                cmd.Parameters.AddWithValue("rate", gen.ProductionRate);
                cmd.Parameters.AddWithValue("ownerId", gen.OwnerId);
                cmd.Parameters.AddWithValue("status", gen.Status);
                cmd.Parameters.AddWithValue("lastGeneratedAt", (object?)gen.LastGeneratedAt ?? DBNull.Value);

                cmd.ExecuteNonQuery();
            }

            tran.Commit();
        }

        public static void AddUsers(List<User> users)
        {
            if (users.Count == 0) return;

            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();
            using var cmd = new NpgsqlCommand
            {
                Connection = conn,
                Transaction = tran
            };

            cmd.CommandText = @"
                INSERT INTO users (id, name, balance, energy_stored, created_at)
                VALUES (@id, @name, @balance, @energyStored, @createdAt)
            ";

            foreach (var user in users)
            {
                cmd.Parameters.Clear();
                cmd.Parameters.AddWithValue("id", user.Id);
                cmd.Parameters.AddWithValue("name", user.Name);
                cmd.Parameters.AddWithValue("balance", user.Balance);
                cmd.Parameters.AddWithValue("energyStored", user.EnergyStored);
                cmd.Parameters.AddWithValue("createdAt", user.CreatedAt);

                cmd.ExecuteNonQuery();
            }

            tran.Commit();
        }

    }
}

