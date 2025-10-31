using Shared.Model;
using Npgsql;

namespace Shared.DB
{
    public class GeneratorsDB : BaseDB
    {
        public static void UpsertUserGenerators(Guid userId, List<UserGeneratorUpdate> updates)
        {
            if (updates == null || updates.Count == 0)
                return;

            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();

            // Prepare arrays for batch processing
            var generatorTypes = updates.Select(u => u.GeneratorType).ToArray();
            var counts = updates.Select(u => u.Count).ToArray();

            // Create userId array with same length as updates
            var userIds = Enumerable.Repeat(userId, updates.Count).ToArray();

            // Single batch insert/update - database trigger handles total_kwh_rate
            using var cmd = new NpgsqlCommand { Connection = conn, Transaction = tran };
            cmd.CommandText = @"
                INSERT INTO user_generators (user_id, generator_type, count, updated_at)
                SELECT u.user_id, u.generator_type, u.count, NOW()
                FROM UNNEST(@userIds, @generatorTypes, @counts) 
                AS u(user_id UUID, generator_type TEXT, count INTEGER)
                ON CONFLICT (user_id, generator_type) DO UPDATE
                SET count = EXCLUDED.count,
                    updated_at = NOW()";

            cmd.Parameters.AddWithValue("userIds", userIds);
            cmd.Parameters.AddWithValue("generatorTypes", generatorTypes);
            cmd.Parameters.AddWithValue("counts", counts);

            cmd.ExecuteNonQuery();
            tran.Commit();
        }

        public static UserGenerators GetGenerators(Guid userId)
        {
            using var conn = GetConnection();
            using var cmd = new NpgsqlCommand(
                @"SELECT ug.generator_type, ug.count, ug.total_kwh_rate
                  FROM user_generators ug
                  WHERE ug.user_id = @userId", conn);

            cmd.Parameters.AddWithValue("userId", userId);

            using var reader = cmd.ExecuteReader();
            var generators = new List<GeneratorOutput>();
            decimal totalKwh = 0;

            while (reader.Read())
            {
                var type = reader.GetString(0);
                var count = reader.GetInt32(1);
                var totalKwhPerType = reader.GetDecimal(2);

                generators.Add(new GeneratorOutput(type, count, totalKwhPerType));
                totalKwh += totalKwhPerType;
            }

            return new UserGenerators(generators, totalKwh);
        }

        public static List<GeneratorType> GetAllGeneratorTypes()
        {
            using var conn = GetConnection();
            using var cmd = new NpgsqlCommand(
                @"SELECT type_key, label, icon, production_rate_kwh
          FROM generator_types
          ORDER BY label", conn);

            using var reader = cmd.ExecuteReader();
            var generatorTypes = new List<GeneratorType>();

            while (reader.Read())
            {
                var typeKey = reader.GetString(0);
                var label = reader.GetString(1);
                var icon = reader.GetString(2);
                var productionRate = reader.GetDecimal(3);

                generatorTypes.Add(new GeneratorType(typeKey, label, icon, productionRate));
            }

            return generatorTypes;
        }

       

    }
}