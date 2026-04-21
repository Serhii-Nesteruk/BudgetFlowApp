using BudgetFlowAPi.Models;
using BudgetFlowAPi.DTO;

namespace BudgetFlowAPi.Mappings;

public static class TransactionMapping
{
    public static IEnumerable<TransactionListDto> ToDtoList(this IEnumerable<Transaction> transactions)
    {
        return transactions.Select(t => t.ToListDto());
    }
    public static TransactionListDto ToListDto(this Transaction transaction)
    {
        return new TransactionListDto
        {
            Amount = transaction.Amount,
            Type = transaction.Type,
            Counterparty = transaction.Counterparty,
            Title = transaction.Title,
            Currency = transaction.Currency,
            Date = transaction.Date
        };
    }

    public static TransactionDetailsDto ToDto(this Transaction transaction)
    {
        return new TransactionDetailsDto
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            Type = transaction.Type,
            Counterparty = transaction.Counterparty,
            Description = transaction.Description,
            Currency = transaction.Currency,
            Date = transaction.Date,
            UserId = transaction.UserId,
            UserName = transaction.User.Name
        };
    }
}