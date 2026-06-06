using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.DTO;

public class SavingsGoalDto
{
    public int Id
    {
        get; set;
    }

    [Required, MaxLength(160)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal? TargetAmount
    {
        get; set;
    }

    [Required, MaxLength(5)]
    public string Currency { get; set; } = "PLN";

    [Required, MaxLength(30)]
    public string Icon { get; set; } = "🫙";

    public List<string> Tags { get; set; } = [];
    public List<SavingsEntryDto> Entries { get; set; } = [];
}

public class SavingsEntryDto
{
    public int Id
    {
        get; set;
    }

    [Range(0.01, double.MaxValue)]
    public decimal Amount
    {
        get; set;
    }

    [Required]
    public DateTime Date
    {
        get; set;
    }

    [MaxLength(500)]
    public string Note { get; set; } = string.Empty;
}
