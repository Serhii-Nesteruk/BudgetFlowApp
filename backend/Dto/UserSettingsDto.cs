using System.ComponentModel.DataAnnotations;
namespace BudgetFlowAPi.DTO;
public class UserSettingsDto
{
    [Required, MaxLength(5)] public string BaseCurrency { get; set; } = "PLN"; [Required, MaxLength(5)] public string Language { get; set; } = "uk"; [Required, MaxLength(12)] public string FontSize { get; set; } = "normal"; [Range(1, 1440)] public int MinimumNotificationGapMinutes { get; set; } = 30; public bool BudgetLimitNotificationsEnabled { get; set; } = true; public bool NewEntryNotificationsEnabled
    {
        get; set;
    }
    public bool DebtDeadlineNotificationsEnabled { get; set; } = true; [Range(0, 365)] public int DebtReminderBeforeDays { get; set; } = 3; [Range(1, 720)] public int DebtReminderRepeatHours { get; set; } = 24; public List<TelegramAccountDto> TelegramAccounts { get; set; } = [];
}
public class TelegramAccountDto
{
    public int Id
    {
        get; set;
    }
    public long TelegramUserId
    {
        get; set;
    }
    public string Username { get; set; } = string.Empty; public string DisplayName { get; set; } = string.Empty; public DateTime ConnectedAt
    {
        get; set;
    }
}
public class TelegramConnectionCodeDto
{
    public string Code { get; set; } = string.Empty; public DateTime ExpiresAt
    {
        get; set;
    }
    public string BotLink { get; set; } = string.Empty;
}
public class TelegramVerifyCodeDto
{
    [Required, StringLength(6, MinimumLength = 6)] public string Code { get; set; } = string.Empty; [Required]
    public long TelegramUserId
    {
        get; set;
    }
    [MaxLength(255)] public string Username { get; set; } = string.Empty; [MaxLength(255)] public string DisplayName { get; set; } = string.Empty;
}
