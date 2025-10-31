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
            app.Urls.Add($"http://localhost:{port}");




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


            app.MapPut("/usergenerators/{userId}", async (Guid userId, HttpContext context) =>
          {
              try
              {
                  if (userId == Guid.Empty)
                  {
                      return Results.BadRequest("Invalid user ID");
                  }

                  var updates = await context.Request.ReadFromJsonAsync<List<UserGeneratorUpdate>>();

                  if (updates == null || updates.Count == 0)
                  {
                      return Results.BadRequest("No generator updates provided");
                  }

                  // Validate the input
                  foreach (var update in updates)
                  {
                      if (string.IsNullOrWhiteSpace(update.GeneratorType))
                      {
                          return Results.BadRequest("Generator type is required");
                      }

                      if (update.Count < 0)
                      {
                          return Results.BadRequest("Generator count cannot be negative");
                      }
                  }

                  GeneratorsDB.UpsertUserGenerators(userId, updates);
                  return Results.Ok(new { message = "User generators updated successfully" });
              }
              catch (Exception ex)
              {
                  return Results.Problem($"Error updating user generators: {ex.Message}");
              }
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

            app.Run();
        }
    }
}
