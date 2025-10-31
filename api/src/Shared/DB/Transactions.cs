using Shared.Model;
using Npgsql;


namespace Shared.DB
{
    public class TransactionsDB : BaseDB
    {
        public static void ExecuteEnergyTransaction(EnergyTransaction tx)
        {
            var users = UsersDB.GetUsersByIds([tx.BuyerId, tx.SellerId]);
            var buyer = users.FirstOrDefault(u => u.Id == tx.BuyerId) ?? throw new Exception("Buyer not found.");
            var seller = users.FirstOrDefault(u => u.Id == tx.SellerId) ?? throw new Exception("Seller not found.");

            if (buyer.Balance < tx.TotalPrice)
                throw new Exception("Buyer does not have enough balance.");
            if (seller.EnergyStored < tx.EnergyAmount)
                throw new Exception("Seller does not have enough energy.");

            var newBuyerBalance = buyer.Balance - tx.TotalPrice;
            var newBuyerEnergy = buyer.EnergyStored + tx.EnergyAmount;
            var newSellerBalance = seller.Balance + tx.TotalPrice;
            var newSellerEnergy = seller.EnergyStored - tx.EnergyAmount;

            using var conn = GetConnection();
            using var tran = conn.BeginTransaction();
            using var cmd = new NpgsqlCommand { Connection = conn, Transaction = tran };

            cmd.CommandText = @"
                UPDATE users
                SET balance = @newBuyerBalance, energy_stored = @newBuyerEnergy, updated_at = NOW()
                WHERE id = @buyerId;

                UPDATE users
                SET balance = @newSellerBalance, energy_stored = @newSellerEnergy, updated_at = NOW()
                WHERE id = @sellerId;

                INSERT INTO transactions (seller_id, buyer_id, energy_amount, price_per_kwh, total_price, created_at)
                VALUES (@sellerId, @buyerId, @energyAmount, @pricePerKwh, @totalPrice, NOW());
            ";

            cmd.Parameters.AddWithValue("buyerId", tx.BuyerId);
            cmd.Parameters.AddWithValue("sellerId", tx.SellerId);
            cmd.Parameters.AddWithValue("energyAmount", tx.EnergyAmount);
            cmd.Parameters.AddWithValue("pricePerKwh", tx.PricePerKwh);
            cmd.Parameters.AddWithValue("totalPrice", tx.TotalPrice);
            cmd.Parameters.AddWithValue("newBuyerBalance", newBuyerBalance);
            cmd.Parameters.AddWithValue("newBuyerEnergy", newBuyerEnergy);
            cmd.Parameters.AddWithValue("newSellerBalance", newSellerBalance);
            cmd.Parameters.AddWithValue("newSellerEnergy", newSellerEnergy);

            cmd.ExecuteNonQuery();
            tran.Commit();
        }



        public static List<EnergyTransaction> GetTransactionsByUserId(
      Guid userId,
            int limit = 50,
            int offset = 0)
        {
            var transactions = new List<EnergyTransaction>();

            using var conn = GetConnection();
            using var cmd = new NpgsqlCommand
            {
                Connection = conn,
                CommandText = @"
                    SELECT id, seller_id, buyer_id, energy_amount, price_per_kwh, total_price, created_at
                    FROM transactions
                    WHERE seller_id = @userId OR buyer_id = @userId
                    ORDER BY created_at DESC
                    LIMIT @limit OFFSET @offset;
                "
            };

            cmd.Parameters.AddWithValue("userId", userId);
            cmd.Parameters.AddWithValue("limit", limit);
            cmd.Parameters.AddWithValue("offset", offset);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var tx = new EnergyTransaction(
                    reader.GetGuid(reader.GetOrdinal("seller_id")),
                    reader.GetGuid(reader.GetOrdinal("buyer_id")),
                    reader.GetDecimal(reader.GetOrdinal("energy_amount")),
                    reader.GetDecimal(reader.GetOrdinal("price_per_kwh"))
                );

                transactions.Add(tx);
            }

            return transactions;
        }

    }
}


