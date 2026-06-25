using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;
using System.Globalization;
using System.Text.RegularExpressions;

namespace BudgetFlowAPi.DTO;

public class ReceiptScanDto
{
    public string Counterparty { get; set; } = string.Empty;
    public List<ReceiptScanItemDto> Items { get; set; } = [];
    public string? Date { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Currency { get; set; }

    public static ReceiptScanDto FromReceipt(ReceiptDto receipt) => new()
    {
        Counterparty = receipt.Counterparty ?? string.Empty,
        Items = (receipt.Items ?? []).Select(ReceiptScanItemDto.FromReceiptItem).ToList(),
        Date = NormalizeReceiptDate(receipt.TransactionDate),
        TotalAmount = receipt.TotalAmount,
        Currency = receipt.Currency
    };

    private static string? NormalizeReceiptDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var raw = value.Trim();
        var isoDate = Regex.Match(raw, @"^\d{4}-\d{2}-\d{2}");
        if (isoDate.Success)
        {
            return isoDate.Value;
        }

        return DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            ? date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            : raw;
    }
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
