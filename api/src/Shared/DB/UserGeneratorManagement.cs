using Npgsql;
using Shared.Model;

namespace Shared.DB
{
    public class UserGeneratorManagement : BaseDB
    {
        public static void UpsertUserWithGenerators(UserWithGenerators data)
        {
            if (data == null || data.User == null || data.Generators == null) return;
            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();
            try
            {
                // Upsert user
                using (var cmd = new NpgsqlCommand(@"
                    INSERT INTO users (id, name, balance, energy_stored, created_at, updated_at)
                    VALUES (@id, @name, @balance, @energyStored, @createdAt, NOW())
                    ON CONFLICT (id) DO UPDATE
                    SET name = EXCLUDED.name,
                        balance = EXCLUDED.balance,
                        energy_stored = EXCLUDED.energy_stored,
                        updated_at = NOW();", conn, tran))
                {
                    cmd.Parameters.AddWithValue("id", data.User.Id);
                    cmd.Parameters.AddWithValue("name", data.User.Name);
                    cmd.Parameters.AddWithValue("balance", data.User.Balance);
                    cmd.Parameters.AddWithValue("energyStored", data.User.EnergyStored);
                    cmd.Parameters.AddWithValue("createdAt", data.User.CreatedAt);

                    cmd.ExecuteNonQuery();
                }

                // Batch upsert user generators
                if (data.Generators.Generators.Count > 0)
                {
                    var valuesList = new List<string>();
                    var cmdBatch = new NpgsqlCommand { Connection = conn, Transaction = tran };

                    for (int i = 0; i < data.Generators.Generators.Count; i++)
                    {
                        var gen = data.Generators.Generators[i];
                        valuesList.Add($"(@userId, @type{i}, @count{i}, @totalKwh{i}, NOW(), NOW())");
                        cmdBatch.Parameters.AddWithValue($"type{i}", gen.Type);
                        cmdBatch.Parameters.AddWithValue($"count{i}", gen.Count);
                        cmdBatch.Parameters.AddWithValue($"totalKwh{i}", gen.TotalKwhPerType);
                    }

                    cmdBatch.Parameters.AddWithValue("userId", data.User.Id);

                    cmdBatch.CommandText = $@"
                        INSERT INTO user_generators (user_id, generator_type, count, total_kwh_rate, created_at, updated_at)
                        VALUES {string.Join(",", valuesList)}
                        ON CONFLICT (user_id, generator_type) DO UPDATE
                        SET count = EXCLUDED.count,
                            total_kwh_rate = EXCLUDED.total_kwh_rate,
                            updated_at = NOW();";

                    cmdBatch.ExecuteNonQuery();
                }

                tran.Commit();
            }
            catch
            {
                tran.Rollback();
                throw;
            }
        }


        public static UserWithGenerators? GetUserWithGenerators(Guid userId)
        {
            using var conn = GetConnection();


            var generators = new List<Generator>();
            User? user = null;

            var sql = @"
                SELECT 
                    u.id, u.name, u.balance, u.energy_stored, u.created_at, u.updated_at,
                    ug.generator_type, ug.count, ug.total_kwh_rate
                FROM users u
                LEFT JOIN user_generators ug ON u.id = ug.user_id
                WHERE u.id = @userId";

            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("userId", userId);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                user = new User(
                    reader.GetGuid(reader.GetOrdinal("id")),
                    reader.GetString(reader.GetOrdinal("name")),
                    reader.GetDecimal(reader.GetOrdinal("balance")),
                    reader.GetDecimal(reader.GetOrdinal("energy_stored")),
                    reader.GetDateTime(reader.GetOrdinal("created_at")),
                    reader.GetDateTime(reader.GetOrdinal("updated_at"))
                );

                var genType = reader["generator_type"];
                if (genType != DBNull.Value)
                {
                    generators.Add(new Generator(
                        reader.GetString(reader.GetOrdinal("generator_type")),
                        reader.GetInt32(reader.GetOrdinal("count")),
                        reader.GetDecimal(reader.GetOrdinal("total_kwh_rate"))
                    ));
                }
            }

            if (user == null) return null;

            var totalKwh = generators.Sum(g => g.TotalKwhPerType);
            return new UserWithGenerators(user, new UserGenerators(generators, totalKwh));
        }
    }

}



