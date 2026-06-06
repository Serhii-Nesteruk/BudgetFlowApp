using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace BudgetFlowAPi.Models;
[Table("budget_categories")]
public class BudgetCategory
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
    [Required, Column("name"), StringLength(120)] public string Name { get; set; } = string.Empty;
    [Column("icon"), StringLength(30)] public string Icon { get; set; } = string.Empty;
    [Column("color"), StringLength(30)] public string Color { get; set; } = string.Empty;
    [Required, Column("limit")]
    public decimal Limit
    {
        get; set;
    }
    [Required, Column("is_active")] public bool IsActive { get; set; } = true;
    [ForeignKey(nameof(BudgetId))] public Budget Budget { get; set; } = null!;
    public ICollection<BudgetCategoryLabel> Labels { get; set; } = new List<BudgetCategoryLabel>();
}
