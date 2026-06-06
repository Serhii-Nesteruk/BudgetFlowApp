using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("savings_goal_tags")]
[Index(nameof(SavingsGoalId))]
[Index(nameof(Value))]
public class SavingsGoalTag
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

    [Required, Column("value"), MaxLength(120)]
    public string Value { get; set; } = string.Empty;

    [ForeignKey(nameof(SavingsGoalId))]
    public SavingsGoal SavingsGoal { get; set; } = null!;
}
