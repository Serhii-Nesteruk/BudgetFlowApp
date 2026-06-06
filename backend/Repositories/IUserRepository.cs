using BudgetFlowAPi.Models;
namespace BudgetFlowAPi.Repositories;
public interface IUserRepository : IRepository<User>
{
 Task<User?> GetByEmailAsync(string email);
 Task<UserSettings?> GetSettingsByUserIdAsync(int userId);
 Task<IEnumerable<TelegramAccount>> GetTelegramAccountsByUserIdAsync(int userId);
 Task<TelegramConnectionCode?> GetValidTelegramConnectionCodeAsync(string code);
 Task<TelegramAccount?> GetTelegramAccountByIdForUserIdAsync(int id,int userId);
 Task<TelegramAccount?> GetTelegramAccountByTelegramUserIdAsync(long telegramUserId);
 Task SaveChangesAsync();
}
