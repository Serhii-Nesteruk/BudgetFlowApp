using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("transaction_tags")]
[Index(nameof(TransactionId))]
[Index(nameof(Value))]
public class TransactionTag
{
    [Key]
    public int Id
    {
        get; set;
    }

    [Required, Column("transaction_id")]
    public int TransactionId
    {
        get; set;
    }

    [Required, Column("value"), MaxLength(120)]
    public string Value { get; set; } = string.Empty;

    [ForeignKey(nameof(TransactionId))]
    public Transaction Transaction { get; set; } = null!;
}
