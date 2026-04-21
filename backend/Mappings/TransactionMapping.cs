using BudgetFlowAPi.Models;
using BudgetFlowAPi.DTO;

namespace BudgetFlowAPi.Mappings;

public static class TransactionMapping
{
    public static Transaction ToEntity(this TransactionDto dto)
    {
        return new Transaction
        {
            Counterparty = dto.Counterparty,
            Title = dto.Title,
            Description = dto.Description,
            Amount = dto.Amount,
            Currency = dto.Currency,
            Date = dto.Date,
            Type = dto.Type
        };
    }
    
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

    public static TransactionDto ToDto(this Transaction transaction)
    {
        return new TransactionDto
        {
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