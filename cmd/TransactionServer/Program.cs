using Microsoft.AspNetCore.Builder;
using Shared.DB;
using Microsoft.AspNetCore.Http;
using Shared.Model;
using System.Text.Json;

namespace TransactionServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Hardcoded args/config
            var port = 5050;

            var builder = WebApplication.CreateBuilder();

            var app = builder.Build();

            var js = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            app.MapPost("/users", async (HttpContext context) =>
            {
                try
                {
                    var usersWithGens = await JsonSerializer.DeserializeAsync<List<UserWithGenerators>>(
                        context.Request.Body, js
                    );

                    if (usersWithGens is null || usersWithGens.Count == 0)
                        return Results.BadRequest(new { error = "No users provided." });

                    // Upsert all users first
                    var users = usersWithGens.Select(uwg => uwg.User).ToList();
                    DB.UpsertUsers(users);

                    // Flatten all generators and set the correct OwnerId
                    var allGenerators = usersWithGens
                        .SelectMany(uwg =>
                        {
                            foreach (var g in uwg.Generators)
                                g.OwnerId = uwg.User.Id;
                            return uwg.Generators;
                        })
                        .ToList();

                    DB.UpsertGenerators(allGenerators);

                    return Results.Json(new
                    {
                        message = $"Upserted {users.Count} users and {allGenerators.Count} generators successfully."
                    });
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Error upserting users and generators: {ex.Message}");
                }
            });



            app.MapPost("/transaction", async (HttpContext context) =>
            {
                try
                {
                    var tx = await JsonSerializer.DeserializeAsync<EnergyTransaction>(
                        context.Request.Body,
                        js
                    );

                    if (tx is null)
                        return Results.BadRequest(new { error = "Invalid transaction payload." });

                    DB.ExecuteEnergyTransaction(tx);

                    return Results.Json(new
                    {
                        message = $"Transaction completed: {tx.EnergyAmount} kWh from {tx.SellerId} to {tx.BuyerId} at {tx.PricePerKwh}/kWh",
                        totalPrice = tx.TotalPrice
                    });
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Transaction failed: {ex.Message}");
                }
            });
            app.Urls.Add($"http://localhost:{port}");
            app.Run();
        }
    }
}
