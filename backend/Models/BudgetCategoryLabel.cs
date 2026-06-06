using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
namespace BudgetFlowAPi.Models;
[Table("budget_category_labels")]
[Index(nameof(BudgetCategoryId), nameof(Value), IsUnique = true)]
public class BudgetCategoryLabel
{
    [Key]
    public int Id
    {
        get; set;
    }
    [Required, Column("budget_category_id")]
    public int BudgetCategoryId
    {
        get; set;
    }
    [Required, Column("value"), StringLength(120)] public string Value { get; set; } = string.Empty; [ForeignKey(nameof(BudgetCategoryId))] public BudgetCategory BudgetCategory { get; set; } = null!;
}
