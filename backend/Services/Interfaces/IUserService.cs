using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;
namespace BudgetFlowAPi.Services;
public interface IUserService : ICrudService<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<UserSettingsDto> GetSettingsAsync(int userId);
    Task<UserSettingsDto> UpdateSettingsAsync(int userId, UserSettingsDto dto);
    Task<TelegramConnectionCodeDto> GenerateTelegramConnectionCodeAsync(int userId, string botLink);
    Task<TelegramAccountDto?> VerifyTelegramConnectionCodeAsync(TelegramVerifyCodeDto dto);
    Task<bool> DeleteTelegramAccountAsync(int userId, int telegramAccountId);
}
