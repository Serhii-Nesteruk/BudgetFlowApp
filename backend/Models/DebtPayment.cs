using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("debt_payments")]
[Index(nameof(DebtId))]
[Index(nameof(Date))]
public class DebtPayment
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("debt_id")]
    public int DebtId { get; set; }

    [Required]
    [Column("date")]
    public DateTime Date { get; set; }

    [Required]
    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("note")]
    public string Note { get; set; } = string.Empty;

    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [ForeignKey(nameof(DebtId))]
    public Debt Debt { get; set; } = null!;
}
