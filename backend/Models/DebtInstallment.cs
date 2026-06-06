using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("debt_installments")]
[Index(nameof(DebtId))]
[Index(nameof(Date))]
public class DebtInstallment
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("debt_id")]
    public int DebtId { get; set; }

    [Required]
    [Column("installment_index")]
    public int Index { get; set; }

    [Required]
    [Column("date")]
    public DateTime Date { get; set; }

    [Required]
    [Column("amount")]
    public decimal Amount { get; set; }

    [Required]
    [Column("paid")]
    public bool Paid { get; set; }

    [ForeignKey(nameof(DebtId))]
    public Debt Debt { get; set; } = null!;
}
