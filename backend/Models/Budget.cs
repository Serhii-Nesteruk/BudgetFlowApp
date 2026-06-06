using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("budgets")]
[Index(nameof(OwnerId))]
[Index(nameof(ShareToken), IsUnique = true)]
[Index(nameof(OwnerId), nameof(Year), nameof(Month), IsUnique = true)]
public class Budget
{
    [Key]
    public int Id
    {
        get; set;
    }
    [Required, Column("owner_id")]
    public int OwnerId
    {
        get; set;
    }
    [Required, Column("type", TypeName = "varchar(20)"), MaxLength(20)] public string Type { get; set; } = BudgetTypes.Monthly;
    [Required, Column("name"), StringLength(255)] public string Name { get; set; } = string.Empty;
    [Required, Column("currency", TypeName = "varchar(5)"), MaxLength(5)] public string Currency { get; set; } = "PLN";
    [Required, Column("total_limit")]
    public decimal TotalLimit
    {
        get; set;
    }
    [Column("month")]
    public int? Month
    {
        get; set;
    }
    [Column("year")]
    public int? Year
    {
        get; set;
    }
    [Column("start_date")]
    public DateTime? StartDate
    {
        get; set;
    }
    [Column("end_date")]
    public DateTime? EndDate
    {
        get; set;
    }
    [Required, Column("telegram_enabled")]
    public bool TelegramEnabled
    {
        get; set;
    }
    [Required, Column("warning_threshold")] public int WarningThreshold { get; set; } = 80;
    [Required, Column("auto_create_next_monthly")] public bool AutoCreateNextMonthly { get; set; } = true;
    [Required, Column("share_token")] public Guid ShareToken { get; set; } = Guid.NewGuid();
    [Required, Column("sharing_enabled")]
    public bool SharingEnabled
    {
        get; set;
    }
    [Required, Column("created_at")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [Column("updated_at")]
    public DateTime? UpdatedAt
    {
        get; set;
    }
    [ForeignKey(nameof(OwnerId))] public User Owner { get; set; } = null!;
    public ICollection<BudgetCategory> Categories { get; set; } = new List<BudgetCategory>();
    public ICollection<BudgetIncomeSource> IncomeSources { get; set; } = new List<BudgetIncomeSource>();
    public ICollection<BudgetMandatoryExpense> MandatoryExpenses { get; set; } = new List<BudgetMandatoryExpense>();
    public ICollection<BudgetPlannedExpense> PlannedExpenses { get; set; } = new List<BudgetPlannedExpense>();
    public ICollection<BudgetSharedUser> SharedUsers { get; set; } = new List<BudgetSharedUser>();
}
