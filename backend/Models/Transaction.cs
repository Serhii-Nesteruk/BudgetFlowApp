using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

public enum TransactionType
{
    Income = 1,
    Expense = 2
}

[Table("transactions")]
[Index(nameof(UserId))]
[Index(nameof(Date))]
[Index(nameof(Receiver))]
public class Transaction
{
    [Key]
    public int Id { get; set; }

    [Column("receiver")]    
    [StringLength(255)]  
    public string Receiver { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Column("amount")]
    public decimal Amount { get; set; }

    [Required]
    [Column("date")]
    public DateTime Date { get; set; }

    [Required]
    [Column("type")]
    public TransactionType Type { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}