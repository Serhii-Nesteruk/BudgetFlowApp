namespace BudgetFlowAPi.DTO;

public class GroupedTransactionDto
{
    public string Id { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public List<GroupedPlaceDto> Places { get; set; } = [];
}

public class GroupedPlaceDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Details { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}