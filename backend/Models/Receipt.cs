using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("receipts")]
public class Receipt
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column("photo", TypeName = "bytea")]
    public byte[] Photo { get; set; } = Array.Empty<byte>();

    [Required]
    [Column("file_name")]
    public string FileName { get; set; } = string.Empty;
    [Required]
    [Column("content_type")]
    public string ContentType { get; set; } = string.Empty;
    
    [Required]
    [Column("date")]
    public DateTime Date { get; set; }

    [Required]
    [Column("amount")]
    public decimal Amount { get; set; }

    [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime? UpdatedAt { get; set; }
}