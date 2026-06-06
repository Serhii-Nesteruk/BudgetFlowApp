using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("debts")]
[Index(nameof(UserId))]
[Index(nameof(DueDate))]
[Index(nameof(Direction))]
[Index(nameof(Status))]
public class Debt
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("direction", TypeName = "varchar(20)")]
    [MaxLength(20)]
    public string Direction { get; set; } = DebtDirections.Payable;

    [Required]
    [Column("type", TypeName = "varchar(20)")]
    [MaxLength(20)]
    public string Type { get; set; } = DebtTypes.OneTime;

    [Required]
    [Column("creditor")]
    [StringLength(255)]
    public string Creditor { get; set; } = string.Empty;

    [Required]
    [Column("amount")]
    public decimal Amount { get; set; }

    [Required]
    [Column("remaining")]
    public decimal Remaining { get; set; }

    [Required]
    [Column("currency", TypeName = "varchar(5)")]
    [MaxLength(5)]
    public string Currency { get; set; } = "UAH";

    [Required]
    [Column("due_date")]
    public DateTime DueDate { get; set; }

    [Required]
    [Column("status", TypeName = "varchar(20)")]
    [MaxLength(20)]
    public string Status { get; set; } = DebtStatuses.Unpaid;

    [Required]
    [Column("priority")]
    public int Priority { get; set; } = 3;

    [Column("notes")]
    public string Notes { get; set; } = string.Empty;

    [Column("total_installments")]
    public int? TotalInstallments { get; set; }

    [Column("paid_installments")]
    public int? PaidInstallments { get; set; }

    [Column("monthly_payment")]
    public decimal? MonthlyPayment { get; set; }

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("recurring_day")]
    public int? RecurringDay { get; set; }

    [Column("recurring_period", TypeName = "varchar(20)")]
    [MaxLength(20)]
    public string? RecurringPeriod { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public ICollection<DebtPayment> PaymentHistory { get; set; } = new List<DebtPayment>();
    public ICollection<DebtInstallment> InstallmentSchedule { get; set; } = new List<DebtInstallment>();
}
