using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.DTO;

public class TransactionDto
{
    [Required]
    public int Id
    {
        get; set;
    }
    [StringLength(255)]
    public string Counterparty { get; set; } = string.Empty;

    [StringLength(255)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Details { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount
    {
        get; set;
    }

    [Required]
    [MaxLength(5)]
    public string Currency { get; set; } = "USD";

    [Required]
    public DateTime Date
    {
        get; set;
    }

    [StringLength(100)]
    public string UserName { get; set; } = string.Empty;
    public int UserId
    {
        get; set;
    }

    [Required]
    public TransactionType Type
    {
        get; set;
    }

    public List<string> Tags { get; set; } = [];
}
