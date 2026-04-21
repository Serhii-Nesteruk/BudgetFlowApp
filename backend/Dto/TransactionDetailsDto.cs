using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.DTO;

public class TransactionDetailsDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string Counterparty { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime Date { get; set; }
}