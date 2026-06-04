using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.DTO;

public class GroupedTransactionDto
{
    [Required]
    public string Id { get; set; } = string.Empty;
    [Required]
    public string Date { get; set; } = string.Empty;
    public List<GroupedPlaceDto> Places { get; set; } = [];
}

public class GroupedPlaceDto
{
    [Required]
    public int Id { get; set; }
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public decimal Amount { get; set; }
    public string Details { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}