using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

public class ReceiptItem
{
    public string? Name
    {
        get; set;
    }

    [Range(0, double.MaxValue, ErrorMessage = "Price must be a non-negative value.")]
    public decimal? Price
    {
        get; set;
    }

    [Range(0, double.MaxValue, ErrorMessage = "Quantity must be a non-negative value.")]
    public decimal? Quantity
    {
        get; set;
    }

    public decimal? UnitPrice
    {
        get; set;
    }

    public decimal? TotalPrice
    {
        get; set;
    }
}
