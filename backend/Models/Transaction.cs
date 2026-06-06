using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BudgetFlowAPi.DTO;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("transactions")]
[Index(nameof(UserId))]
[Index(nameof(Date))]
[Index(nameof(Counterparty))]
public class Transaction
{
    [Key]
    public int Id
    {
        get; set;
    }

    [Column("counterparty")]
    [StringLength(255)]
    public string Counterparty { get; set; } = string.Empty;

    [Column("title")]
    [StringLength(255)]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("details")]
    public string Details { get; set; } = string.Empty;

    [Required]
    [Column("amount")]
    public decimal Amount
    {
        get; set;
    }

    [Required]
    [Column("currency", TypeName = "varchar(5)")]
    [MaxLength(5)]
    [DefaultValue("USD")]
    public string Currency { get; set; } = string.Empty; // TODO: use white list of currencies

    [Required]
    [Column("date")]
    public DateTime Date
    {
        get; set;
    }

    [Required]
    [Column("type")]
    public TransactionType Type
    {
        get; set;
    }

    [Required]
    [Column("user_id")]
    public int UserId
    {
        get; set;
    }

    [Required]
    [Column("created_at")]
    public DateTime CreatedAt
    {
        get; set;
    }

    [Column("updated_at")]
    public DateTime? UpdatedAt
    {
        get; set;
    }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public ICollection<TransactionTag> Tags { get; set; } = new List<TransactionTag>();
}
