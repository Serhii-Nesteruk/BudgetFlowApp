using BudgetFlowAPi.Models;
using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

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
            Type = dto.Type,
            Tags = NormalizeTags(dto.Tags).Select(x => new TransactionTag { Value = x }).ToList()
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
            Date = transaction.Date,
            Tags = transaction.Tags.Select(x => x.Value).ToList()
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
            Tags = transaction.Tags.Select(x => x.Value).ToList(),
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

    public static Transaction FromReceiptFieldsToTransaction(ReceiptDto? receipt)
    {
        var now = DateTime.UtcNow;

        return new Transaction
        {
            Counterparty = receipt?.Counterparty ?? string.Empty,
            Title = receipt?.Counterparty ?? "Receipt",
            Description = BuildDescription(receipt),
            Details = BuildDetails(receipt),
            Amount = receipt?.TotalAmount ?? 0m,
            Currency = receipt?.Currency ?? "USD",
            Date = ToUtc(receipt?.TransactionDate, now),
            Type = TransactionType.Expense,
            CreatedAt = now
        };
    }

    private static DateTime ToUtc(DateTime? value, DateTime fallback)
    {
        if (value is null)
            return fallback;

        return value.Value.Kind switch
        {
            DateTimeKind.Utc => value.Value,
            DateTimeKind.Local => value.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
        };
    }

    private static string BuildDescription(ReceiptDto? receipt)
    {
        if (string.IsNullOrWhiteSpace(receipt?.Counterparty))
            return "Receipt transaction";

        return $"Purchase at {receipt.Counterparty}";
    }

    private static string BuildDetails(ReceiptDto? receipt)
    {
        if (receipt?.Items is null || !receipt.Items.Any())
            return string.Empty;

        return string.Join(
            Environment.NewLine,
            receipt.Items.Select(item =>
            {
                var name = item.Name ?? "Unknown item";
                var quantity = item.Quantity ?? 1;
                var price = item.Price ?? 0m;

                return $"{name} x{quantity} - {price}";
            }));
    }
    public static IEnumerable<string> NormalizeTags(IEnumerable<string>? tags) =>
        (tags ?? [])
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim().ToLowerInvariant())
            .Distinct(StringComparer.OrdinalIgnoreCase);

    private static GroupedPlaceDto ToPlaceDto(Transaction transaction)
    {
        return new GroupedPlaceDto
        {
            Id = transaction.Id,
            Name = transaction.Counterparty,
            Amount = transaction.Amount,
            Details = transaction.Details,
            Currency = transaction.Currency,
            Notes = transaction.Description,
            Tags = transaction.Tags.Select(x => x.Value).ToList()
        };
    }
}
