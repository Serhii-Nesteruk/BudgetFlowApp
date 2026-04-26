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
            Details = dto.Details,
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
            Id = transaction.Id,
            Amount = transaction.Amount,
            Type = transaction.Type,
            Counterparty = transaction.Counterparty,
            Title = transaction.Title,
            Description = transaction.Description,
            Details = transaction.Details,
            Currency = transaction.Currency,
            Date = transaction.Date,
        };
    }   

    public static List<GroupedTransactionDto> ToGroupedDtoList(IEnumerable<Transaction> transactions)
    {
        return transactions
            .GroupBy(t => t.Date.Date)
            .OrderByDescending(g => g.Key)
            .Select(g => new GroupedTransactionDto
            {
                Id = g.Key.ToString("yyyy-MM-dd"),
                Date = g.Key.ToString("yyyy-MM-dd"),
                Places = g
                    .OrderBy(t => t.Id)
                    .Select(ToPlaceDto)
                    .ToList()
            })
            .ToList();
    }

    private static GroupedPlaceDto ToPlaceDto(Transaction transaction)
    {
        return new GroupedPlaceDto
        {
            Id = transaction.Id,
            Name = transaction.Counterparty,
            Amount = transaction.Amount,
            Details = transaction.Details,
            Notes = transaction.Description
        };
    }
}