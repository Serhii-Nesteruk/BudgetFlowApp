using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("telegram_accounts")]
[Index(nameof(TelegramUserId), IsUnique = true)]
public class TelegramAccount
{
    [Key] public int Id { get; set; }
    [Required, Column("user_id")] public int UserId { get; set; }
    [Required, Column("telegram_user_id")] public long TelegramUserId { get; set; }
    [Column("username"), StringLength(255)] public string Username { get; set; } = string.Empty;
    [Column("display_name"), StringLength(255)] public string DisplayName { get; set; } = string.Empty;
    [Required, Column("connected_at")] public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;
    [ForeignKey(nameof(UserId))] public User User { get; set; } = null!;
}
