using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Mappings;

public static class BudgetMapping
{
    public static BudgetDto ToDto(this Budget budget) => new()
    {
        Id = budget.Id,
        Type = budget.Type,
        Name = budget.Name,
        Currency = budget.Currency,
        TotalLimit = budget.TotalLimit,
        Month = budget.Month,
        Year = budget.Year,
        StartDate = budget.StartDate,
        EndDate = budget.EndDate,
        TelegramEnabled = budget.TelegramEnabled,
        WarningThreshold = budget.WarningThreshold,
        AutoCreateNextMonthly = budget.AutoCreateNextMonthly,
        ShareToken = budget.ShareToken,
        SharingEnabled = budget.SharingEnabled,
        Categories = budget.Categories.Select(x => x.ToDto()).ToList(),
        IncomeSources = budget.IncomeSources.Select(x => x.ToDto()).ToList(),
        MandatoryExpenses = budget.MandatoryExpenses.Select(x => x.ToDto()).ToList(),
        PlannedExpenses = budget.PlannedExpenses.Select(x => x.ToDto()).ToList(),
        SharedUsers = budget.SharedUsers.Select(x => new BudgetSharedUserDto
        {
            UserId = x.UserId,
            Name = x.User.Name,
            Email = x.User.Email,
        }).ToList(),
    };

    public static BudgetCategoryDto ToDto(this BudgetCategory x) => new()
    {
        Id = x.Id,
        Name = x.Name,
        Icon = x.Icon,
        Color = x.Color,
        Limit = x.Limit,
        IsActive = x.IsActive,
        Labels = x.Labels.Select(l => l.Value).ToList(),
    };

    public static BudgetIncomeSourceDto ToDto(this BudgetIncomeSource x) => new()
    {
        Id = x.Id,
        Name = x.Name,
        Amount = x.Amount,
        Frequency = x.Frequency,
        ExpectedDate = x.ExpectedDate,
        IsReceived = x.IsReceived,
    };

    public static BudgetMandatoryExpenseDto ToDto(this BudgetMandatoryExpense x) => new()
    {
        Id = x.Id,
        BudgetCategoryId = x.BudgetCategoryId,
        Name = x.Name,
        Amount = x.Amount,
        DueDate = x.DueDate,
        Frequency = x.Frequency,
        IsPaid = x.IsPaid,
    };

    public static BudgetPlannedExpenseDto ToDto(this BudgetPlannedExpense x) => new()
    {
        Id = x.Id,
        BudgetCategoryId = x.BudgetCategoryId,
        Name = x.Name,
        Amount = x.Amount,
        Date = x.Date,
        IsPaid = x.IsPaid,
        Notes = x.Notes,
    };

    public static BudgetCategory ToEntity(this BudgetCategoryDto x) => new()
    {
        Name = x.Name,
        Icon = x.Icon,
        Color = x.Color,
        Limit = x.Limit,
        IsActive = x.IsActive,
        Labels = x.Labels
            .Where(l => !string.IsNullOrWhiteSpace(l))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(l => new BudgetCategoryLabel { Value = l.Trim().ToLowerInvariant() })
            .ToList(),
    };

    public static BudgetIncomeSource ToEntity(this BudgetIncomeSourceDto x) => new()
    {
        Name = x.Name,
        Amount = x.Amount,
        Frequency = x.Frequency,
        ExpectedDate = x.ExpectedDate,
        IsReceived = x.IsReceived,
    };

    public static BudgetMandatoryExpense ToEntity(this BudgetMandatoryExpenseDto x) => new()
    {
        BudgetCategoryId = x.BudgetCategoryId,
        Name = x.Name,
        Amount = x.Amount,
        DueDate = x.DueDate,
        Frequency = x.Frequency,
        IsPaid = x.IsPaid,
    };

    public static BudgetPlannedExpense ToEntity(this BudgetPlannedExpenseDto x) => new()
    {
        BudgetCategoryId = x.BudgetCategoryId,
        Name = x.Name,
        Amount = x.Amount,
        Date = x.Date,
        IsPaid = x.IsPaid,
        Notes = x.Notes,
    };
}
