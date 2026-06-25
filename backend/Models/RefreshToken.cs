using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("refresh_tokens")]
[Index(nameof(Token), IsUnique = true)]
public class RefreshToken
{
    [Key]
    public int Id { get; set; }

    [Column("token")]
    [StringLength(128)]
    [Required]
    public string Token { get; set; } = string.Empty;

    [Column("user_id")]
    [Required]
    public int UserId { get; set; }

    [Column("expires_at")]
    [Required]
    public DateTime ExpiresAt { get; set; }

    [Column("created_at")]
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("revoked_at")]
    public DateTime? RevokedAt { get; set; }

    public User? User { get; set; }

    [NotMapped]
    public bool IsActive => RevokedAt == null && ExpiresAt > DateTime.UtcNow;
}
