using System.Text.Json.Serialization;

namespace BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

public class ReceiptDto
{
    public string? Counterparty
    {
        get; set;
    }
    public IEnumerable<ReceiptItem>? Items
    {
        get; set;
    }

    [JsonPropertyName("Date")]
    public string? TransactionDate
    {
        get; set;
    }

    public decimal? TotalAmount
    {
        get; set;
    }

    public string? Currency
    {
        get; set;
    }
}
