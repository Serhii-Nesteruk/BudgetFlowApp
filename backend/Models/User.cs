using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Models;

[Table("users")]
[Index(nameof(Email), IsUnique = true)]
public class User
{
    [Key]
    public int Id { get; set; }
    
    [Column("name")]
    [StringLength(100)]
    [Required]
    public string Name { get; set; } = String.Empty;
    
    [Column("email")]
    [StringLength(255)]
    [Required]
    public string Email { get; set; } = String.Empty;
    
    [Column("password_hash")]
    [StringLength(255)]
    [Required]
    public string PasswordHash { get; set; } = String.Empty;

  [Required]
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]  
    public DateTime? UpdatedAt { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Debt> Debts { get; set; } = new List<Debt>();
}