using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

public class ReceiptItem
{
    public string? Name { get; set; }
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be a non-negative value.")]
    public decimal? Price { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Quantity must be a non-negative value.")]
    public int? Quantity { get; set; }
}