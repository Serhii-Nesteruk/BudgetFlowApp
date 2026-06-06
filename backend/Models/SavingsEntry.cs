using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("savings_entries")]
[Index(nameof(SavingsGoalId))]
[Index(nameof(Date))]
public class SavingsEntry
{
    [Key]
    public int Id
    {
        get; set;
    }

    [Required, Column("savings_goal_id")]
    public int SavingsGoalId
    {
        get; set;
    }

    [Required, Column("amount")]
    public decimal Amount
    {
        get; set;
    }

    [Required, Column("date")]
    public DateTime Date
    {
        get; set;
    }

    [Column("note"), MaxLength(500)]
    public string Note { get; set; } = string.Empty;

    [Required, Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(SavingsGoalId))]
    public SavingsGoal SavingsGoal { get; set; } = null!;
}
