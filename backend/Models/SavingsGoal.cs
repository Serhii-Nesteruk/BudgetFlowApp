using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("savings_goals")]
[Index(nameof(UserId))]
public class SavingsGoal
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

    [Required, Column("name"), MaxLength(160)]
    public string Name { get; set; } = string.Empty;

    [Column("description"), MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Column("target_amount")]
    public decimal? TargetAmount
    {
        get; set;
    }

    [Required, Column("currency", TypeName = "varchar(5)"), MaxLength(5)]
    public string Currency { get; set; } = "PLN";

    [Required, Column("icon"), MaxLength(30)]
    public string Icon { get; set; } = "🫙";

    [Required, Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime? UpdatedAt
    {
        get; set;
    }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public ICollection<SavingsGoalTag> Tags { get; set; } = new List<SavingsGoalTag>();
    public ICollection<SavingsEntry> Entries { get; set; } = new List<SavingsEntry>();
}
