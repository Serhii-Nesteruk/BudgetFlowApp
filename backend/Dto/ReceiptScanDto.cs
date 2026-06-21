using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

namespace BudgetFlowAPi.DTO;

public class ReceiptScanDto
{
    public string Counterparty { get; set; } = string.Empty;
    public List<ReceiptScanItemDto> Items { get; set; } = [];
    public DateTime? Date { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Currency { get; set; }

    public static ReceiptScanDto FromReceipt(ReceiptDto receipt) => new()
    {
        Counterparty = receipt.Counterparty ?? string.Empty,
        Items = (receipt.Items ?? []).Select(ReceiptScanItemDto.FromReceiptItem).ToList(),
        Date = receipt.TransactionDate,
        TotalAmount = receipt.TotalAmount,
        Currency = receipt.Currency
    };
}

public class ReceiptScanItemDto
{
    public string Name { get; set; } = string.Empty;
    public decimal? Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }

    public static ReceiptScanItemDto FromReceiptItem(ReceiptItem item) => new()
    {
        Name = item.Name ?? string.Empty,
        Quantity = item.Quantity,
        UnitPrice = item.UnitPrice,
        TotalPrice = item.TotalPrice ?? item.Price
    };
}
