using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.DTO;

public class TransactionListDto
{
    [StringLength(255)]
    public string Counterparty { get; set; } = string.Empty;

    [StringLength(255)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount
    {
        get; set;
    }

    [Required]
    [MaxLength(5)]
    public string Currency { get; set; } = string.Empty;

    [Required]
    public TransactionType Type
    {
        get; set;
    }

    [Required]
    public DateTime Date
    {
        get; set;
    }

    public List<string> Tags { get; set; } = [];
}
