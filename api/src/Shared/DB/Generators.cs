using Shared.Model;
using Npgsql;
namespace Shared.DB
{
    public class GeneratorsDB : BaseDB
    {
        public static List<Generator> GetGenerators(int limit = 100, int offset = 0)
        {
            var generators = new List<Generator>();

            using var conn = GetConnection();
            using var cmd = new NpgsqlCommand(
                @"SELECT id, type, production_rate, owner_id, status, last_generated_at
                  FROM generators
                  ORDER BY created_at, id
                  LIMIT @limit OFFSET @offset", conn
            );

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

        public static void UpsertGenerators(List<Generator> generators)
        {
            if (generators.Count == 0) return;

            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();
            using var cmd = new NpgsqlCommand { Connection = conn, Transaction = tran };

            cmd.CommandText = @"
                INSERT INTO generators (id, type, production_rate, owner_id, status, last_generated_at, created_at, updated_at)
                VALUES (@id, @type, @rate, @ownerId, @status, @lastGeneratedAt, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE
                SET type = EXCLUDED.type,
                    production_rate = EXCLUDED.production_rate,
                    owner_id = EXCLUDED.owner_id,
                    status = EXCLUDED.status,
                    last_generated_at = EXCLUDED.last_generated_at,
                    updated_at = NOW()
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
    }
}
