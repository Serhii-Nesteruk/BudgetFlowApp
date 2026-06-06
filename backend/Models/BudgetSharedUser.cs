using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace BudgetFlowAPi.Models;
[Table("budget_shared_users")]
[Index(nameof(BudgetId), nameof(UserId), IsUnique = true)]
public class BudgetSharedUser
{
    [Key]
    public int Id
    {
        get; set;
    }
    [Required, Column("budget_id")]

    public int BudgetId
    {
        get; set;
    }
    [Required, Column("user_id")]

    public int UserId
    {
        get; set;
    }

    [Required, Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(BudgetId))]
    public Budget Budget { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
