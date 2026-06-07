using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;
namespace BudgetFlowAPi.Mappings;
public static class UserSettingsMapping
{
    public static UserSettingsDto ToDto(this UserSettings settings, IEnumerable<TelegramAccount> accounts) => new()
    {
        BaseCurrency = settings.BaseCurrency,
        Language = settings.Language,
        FontSize = NormalizeFontSize(settings.FontSize),
        MinimumNotificationGapMinutes = settings.MinimumNotificationGapMinutes,
        BudgetLimitNotificationsEnabled = settings.BudgetLimitNotificationsEnabled,
        NewEntryNotificationsEnabled = settings.NewEntryNotificationsEnabled,
        DebtDeadlineNotificationsEnabled = settings.DebtDeadlineNotificationsEnabled,
        DebtReminderBeforeDays = settings.DebtReminderBeforeDays,
        DebtReminderRepeatHours = settings.DebtReminderRepeatHours,
        TelegramAccounts = accounts.Select(account => new TelegramAccountDto
        {
            Id = account.Id,
            TelegramUserId = account.TelegramUserId,
            Username = account.Username,
            DisplayName = account.DisplayName,
            ConnectedAt = account.ConnectedAt
        }).ToList()
    };
    public static void Apply(this UserSettingsDto dto, UserSettings settings)
    {
        settings.BaseCurrency = dto.BaseCurrency;
        settings.Language = dto.Language;
        settings.FontSize = NormalizeFontSize(dto.FontSize);
        settings.MinimumNotificationGapMinutes = dto.MinimumNotificationGapMinutes;
        settings.BudgetLimitNotificationsEnabled = dto.BudgetLimitNotificationsEnabled;
        settings.NewEntryNotificationsEnabled = dto.NewEntryNotificationsEnabled;
        settings.DebtDeadlineNotificationsEnabled = dto.DebtDeadlineNotificationsEnabled;
        settings.DebtReminderBeforeDays = dto.DebtReminderBeforeDays;
        settings.DebtReminderRepeatHours = dto.DebtReminderRepeatHours;
        settings.UpdatedAt = DateTime.UtcNow;
    }

    private static string NormalizeFontSize(string? value) =>
        value is "compact" or "large" ? value : "normal";
}
