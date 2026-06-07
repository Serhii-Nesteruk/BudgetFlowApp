using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("user_settings")]
[Index(nameof(UserId), IsUnique = true)]
public class UserSettings
{
    [Key]
    public int Id
    {
        get; set;
    }
    [Required, Column("user_id")]
    public int UserId
    {
        get; set;
    }
    [Required, Column("base_currency", TypeName = "varchar(5)"), MaxLength(5)] public string BaseCurrency { get; set; } = "PLN";
    [Required, Column("language", TypeName = "varchar(5)"), MaxLength(5)] public string Language { get; set; } = "uk";
    [Required, Column("font_size", TypeName = "varchar(12)"), MaxLength(12)] public string FontSize { get; set; } = "normal";
    [Required, Column("minimum_notification_gap_minutes")] public int MinimumNotificationGapMinutes { get; set; } = 30;
    [Required, Column("budget_limit_notifications_enabled")] public bool BudgetLimitNotificationsEnabled { get; set; } = true;
    [Required, Column("new_entry_notifications_enabled")]
    public bool NewEntryNotificationsEnabled
    {
        get; set;
    }
    [Required, Column("debt_deadline_notifications_enabled")] public bool DebtDeadlineNotificationsEnabled { get; set; } = true;
    [Required, Column("debt_reminder_before_days")] public int DebtReminderBeforeDays { get; set; } = 3;
    [Required, Column("debt_reminder_repeat_hours")] public int DebtReminderRepeatHours { get; set; } = 24;
    [Required, Column("created_at")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [Column("updated_at")]
    public DateTime? UpdatedAt
    {
        get; set;
    }
    [ForeignKey(nameof(UserId))] public User User { get; set; } = null!;
}
