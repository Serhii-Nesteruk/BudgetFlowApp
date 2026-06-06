using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("telegram_connection_codes")]
[Index(nameof(Code), IsUnique = true)]
[Index(nameof(UserId))]
public class TelegramConnectionCode
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
    [Required, Column("code"), StringLength(6)] public string Code { get; set; } = string.Empty;
    [Required, Column("expires_at")]
    public DateTime ExpiresAt
    {
        get; set;
    }
    [Required, Column("is_used")]
    public bool IsUsed
    {
        get; set;
    }
    [Required, Column("created_at")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [Column("used_at")]
    public DateTime? UsedAt
    {
        get; set;
    }
    [ForeignKey(nameof(UserId))] public User User { get; set; } = null!;
}
