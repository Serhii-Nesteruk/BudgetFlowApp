namespace BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

public class ReceiptDto
{
    public string? Counterparty { get; set; }
    public IEnumerable<ReceiptItem>? Items { get; set; }
    public DateTime? TransactionDate { get; set; }
    public decimal? TotalAmount { get; set; }
}