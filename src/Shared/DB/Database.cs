﻿
using Shared.Model;
using Npgsql;

namespace Shared.DB
{

    public class DB
    {
        private static readonly string _connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION") ?? "";


        private static NpgsqlConnection GetConnection()
        {
            var conn = new NpgsqlConnection(_connectionString);
            conn.Open();
            return conn;
        }



        public static List<Generator> GetGenerators(int limit = 100, int offset = 0)
        {
            var generators = new List<Generator>();

            using var conn = GetConnection();
            using var cmd = new NpgsqlCommand(
                @"
                    SELECT id, type, production_rate, owner_id, status, last_generated_at
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
            using var tran = conn.BeginTransaction(); // wrap in transaction for safety
            using var cmd = new NpgsqlCommand
            {
                Connection = conn,
                Transaction = tran
            };

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


        public static void UpsertUsers(List<User> users)
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
        INSERT INTO users (id, name, balance, energy_stored, created_at, updated_at)
        VALUES (@id, @name, @balance, @energyStored, @createdAt, NOW())
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            balance = EXCLUDED.balance,
            energy_stored = EXCLUDED.energy_stored,
            updated_at = NOW()
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


        public static List<User> GetUsers(int limit = 100, int offset = 0)
        {
            var users = new List<User>();

            using var conn = GetConnection();
            using var cmd = new NpgsqlCommand(
                @"SELECT id, name, balance, energy_stored, created_at, updated_at
          FROM users
          ORDER BY created_at, id
          LIMIT @limit OFFSET @offset", conn
            );

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


        public static void UpdateUsersEnergyStore(List<UserEnergyUpdate> updates)
        {
            if (updates.Count == 0) return;

            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();
            using var cmd = new NpgsqlCommand
            {
                Connection = conn,
                Transaction = tran
            };

            cmd.CommandText = @"
            UPDATE users
            SET energy_stored = energy_stored + @energyStored,
                updated_at = NOW()
            WHERE id = @id
            ";

            foreach (var update in updates)
            {
                cmd.Parameters.Clear();
                cmd.Parameters.AddWithValue("id", update.UserId);
                cmd.Parameters.AddWithValue("energyStored", update.Energy);

                cmd.ExecuteNonQuery();
            }

            tran.Commit();
        }



    }
}

