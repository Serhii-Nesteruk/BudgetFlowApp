namespace BudgetFlowAPi.DTO;

public class TransactionListDto
{
    public string Counterparty { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public DateTime Date { get; set; }
}