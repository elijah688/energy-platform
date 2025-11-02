using Shared;
using Shared.DB;
using Shared.Model;
using System.Text.Json;

namespace TransactionServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Hardcoded args/config
            var port = int.TryParse(Environment.GetEnvironmentVariable("PORT"), out var p) ? p : 5050;

            var builder = WebApplication.CreateBuilder();

            builder.Services.AddCors(options =>
                {
                    options.AddDefaultPolicy(policy =>
                    {
                        policy
                            .AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
                });


            var app = builder.Build();
            app.UseCors();
            app.Urls.Add($"http://0.0.0.0:{port}");




            var js = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };


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

                    TransactionsDB.ExecuteEnergyTransaction(tx);

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


            app.MapGet("/users", (int? limit, int? offset, string? name) =>
                {
                    try
                    {
                        int l = limit ?? 100;
                        int o = offset ?? 0;

                        var usersWithGens = UsersDB.GetUsers(l, o, name);

                        return Results.Json(usersWithGens);
                    }
                    catch (Exception ex)
                    {
                        return Results.Problem($"Error fetching users with generators: {ex.Message}");
                    }
                });







            app.MapGet("/transactions", (Guid userId, int? limit, int? offset) =>
            {
                int l = limit ?? 50;
                int o = offset ?? 0;

                var transactions = TransactionsDB.GetTransactionsByUserId(userId, l, o);
                return Results.Json(transactions);
            });



            app.MapGet("/usergenerators/{userId}", (Guid userId) =>
            {
                try
                {
                    if (userId == Guid.Empty)
                    {
                        return Results.BadRequest("Invalid user ID");
                    }

                    var userGenerators = GeneratorsDB.GetGenerators(userId);
                    return Results.Json(userGenerators);
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Error fetching user generators: {ex.Message}");
                }
            });
            app.MapGet("/generatortypes", () =>
            {
                try
                {
                    var generatorTypes = GeneratorsDB.GetAllGeneratorTypes();
                    return Results.Json(generatorTypes);
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Error fetching generator types: {ex.Message}");
                }
            });

            app.MapPost("/users/upsert", (UserWithGenerators data) =>
                {


                    if (data == null || data.User == null)
                        return Results.BadRequest(new { success = false, message = "Invalid user data" });

                    try
                    {
                        UserGeneratorManagement.UpsertUserWithGenerators(data);

                        return Results.Ok(new
                        {
                            success = true,
                            userId = data.User.Id,
                            totalGenerators = data.Generators?.Generators.Count ?? 0,
                            totalKwh = data.Generators?.TotalKwh ?? 0
                        });
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                        return Results.Problem(ex.Message);
                    }
                });


            app.MapGet("/usergenerators/{userId:guid}", (Guid userId) =>
            {
                try
                {
                    var userWithGenerators = UserGeneratorManagement.GetUserWithGenerators(userId);
                    if (userWithGenerators == null)
                        return Results.NotFound(new { success = false, message = "User not found" });

                    return Results.Ok(userWithGenerators);
                }
                catch (Exception ex)
                {
                    return Results.Problem(ex.Message);
                }
            });

            app.Run();
        }


    }
}
