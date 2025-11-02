using Shared.Model;
using Npgsql;
using Shared.DB;

namespace Shared.DB
{
    public class UsersDB : BaseDB
    {
        public static List<User> GetUsers(int limit = 100, int offset = 0, string? name = null)
        {
            var users = new List<User>();

            using var conn = GetConnection();

            var sql = @"
                SELECT id, name, balance, energy_stored, created_at, updated_at
                FROM users
            ";

            if (!string.IsNullOrEmpty(name))
                sql += " WHERE name ILIKE @name";

            sql += " ORDER BY created_at, id LIMIT @limit OFFSET @offset";

            using var cmd = new NpgsqlCommand(sql, conn);

            if (!string.IsNullOrEmpty(name))
                cmd.Parameters.AddWithValue("name", $"%{name}%");

            cmd.Parameters.AddWithValue("limit", limit);
            cmd.Parameters.AddWithValue("offset", offset);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                users.Add(new User
                {
                    Id = reader.GetGuid(0),
                    Name = reader.GetString(1),
                    Balance = reader.GetDecimal(2),
                    EnergyStored = reader.GetDecimal(3),
                    CreatedAt = reader.GetDateTime(4),
                    UpdatedAt = reader.GetDateTime(5)
                });
            }

            return users;
        }


        public static void UpsertUser(User user)
        {
            if (user == null) return;

            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();

            using var cmd = new NpgsqlCommand { Connection = conn, Transaction = tran };

            cmd.CommandText = @"
                INSERT INTO users (id, name, balance, energy_stored, created_at, updated_at)
                VALUES (@id, @name, @balance, @energyStored, @createdAt, NOW())
                ON CONFLICT (id) DO UPDATE
                SET name = EXCLUDED.name,
                    balance = EXCLUDED.balance,
                    energy_stored = EXCLUDED.energy_stored,
                    updated_at = NOW()";

            cmd.Parameters.AddWithValue("id", user.Id);
            cmd.Parameters.AddWithValue("name", user.Name);
            cmd.Parameters.AddWithValue("balance", user.Balance);
            cmd.Parameters.AddWithValue("energyStored", user.EnergyStored);
            cmd.Parameters.AddWithValue("createdAt", user.CreatedAt);

            cmd.ExecuteNonQuery();
            tran.Commit();
        }

        public static List<User> GetUsersByIds(List<Guid> ids)
        {
            if (ids.Count == 0) return [];

            var users = new List<User>();
            using var conn = GetConnection();
            using var cmd = new NpgsqlCommand { Connection = conn };

            cmd.CommandText = @"
                SELECT id, name, balance, energy_stored, created_at, updated_at
                FROM users
                WHERE id = ANY(@ids)
            ";
            cmd.Parameters.AddWithValue("ids", ids.ToArray());

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                users.Add(new User
                {
                    Id = reader.GetGuid(0),
                    Name = reader.GetString(1),
                    Balance = reader.GetDecimal(2),
                    EnergyStored = reader.GetDecimal(3),
                    CreatedAt = reader.GetDateTime(4),
                    UpdatedAt = reader.GetDateTime(5)
                });
            }

            return users;
        }

        public static void UpdateUsersEnergyStore(List<UserEnergyUpdate> updates)
        {
            if (updates.Count == 0) return;

            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();
            using var cmd = new NpgsqlCommand { Connection = conn, Transaction = tran };

            // Build the VALUES list dynamically
            var values = string.Join(", ", updates.Select((u, i) => $"(@id{i}, @energy{i})"));

            cmd.CommandText = $@"
                UPDATE users u
                SET energy_stored = u.energy_stored + v.energy,
                    updated_at = NOW()
                FROM (VALUES {values}) AS v(id, energy)
                WHERE u.id = v.id;
            ";

            // Add parameters
            for (int i = 0; i < updates.Count; i++)
            {
                cmd.Parameters.AddWithValue($"id{i}", updates[i].UserId);
                cmd.Parameters.AddWithValue($"energy{i}", updates[i].Energy);
            }

            cmd.ExecuteNonQuery();
            tran.Commit();
        }

    }
}
