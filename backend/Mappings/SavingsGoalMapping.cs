using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Mappings;

public static class SavingsGoalMapping
{
    public static SavingsGoalDto ToDto(this SavingsGoal goal) => new()
    {
        Id = goal.Id,
        Name = goal.Name,
        Description = goal.Description,
        TargetAmount = goal.TargetAmount,
        Currency = goal.Currency,
        Icon = goal.Icon,
        Tags = goal.Tags.Select(x => x.Value).ToList(),
        Entries = goal.Entries
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.Id)
            .Select(x => x.ToDto())
            .ToList(),
    };

    public static SavingsEntryDto ToDto(this SavingsEntry entry) => new()
    {
        Id = entry.Id,
        Amount = entry.Amount,
        Currency = entry.Currency,
        Date = entry.Date,
        Note = entry.Note,
    };

    public static SavingsGoal ToEntity(this SavingsGoalDto dto, int userId) => new()
    {
        UserId = userId,
        Name = dto.Name.Trim(),
        Description = dto.Description.Trim(),
        TargetAmount = dto.TargetAmount,
        Currency = dto.Currency.Trim().ToUpperInvariant(),
        Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "🫙" : dto.Icon.Trim(),
        Tags = NormalizeTags(dto.Tags)
            .Select(x => new SavingsGoalTag { Value = x })
            .ToList(),
        CreatedAt = DateTime.UtcNow,
    };

    public static SavingsEntry ToEntity(this SavingsEntryDto dto, string goalCurrency) => new()
    {
        Amount = dto.Amount,
        Currency = NormalizeCurrency(dto.Currency, goalCurrency),
        Date = dto.Date,
        Note = dto.Note.Trim(),
        CreatedAt = DateTime.UtcNow,
    };

    public static string NormalizeCurrency(string? currency, string fallback) =>
        (string.IsNullOrWhiteSpace(currency) ? fallback : currency).Trim().ToUpperInvariant();

    public static IEnumerable<string> NormalizeTags(IEnumerable<string>? tags) =>
        (tags ?? [])
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x.Trim().ToLowerInvariant())
            .Distinct(StringComparer.OrdinalIgnoreCase);
}
