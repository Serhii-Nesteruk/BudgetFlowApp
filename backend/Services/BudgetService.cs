using BudgetFlowAPi.Data;
using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Mappings;
using BudgetFlowAPi.Models;
using BudgetFlowAPi.Repositories;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Services;

public class BudgetService : CrudService<Budget>, IBudgetService
{
    private readonly IBudgetRepository _budgetRepository;
    private readonly IUserRepository _userRepository;
    private readonly AppDbContext _context;

    public BudgetService(
        IBudgetRepository budgetRepository,
        IUserRepository userRepository,
        AppDbContext context)
        : base(budgetRepository)
    {
        _budgetRepository = budgetRepository;
        _userRepository = userRepository;
        _context = context;
    }

    public async Task<IEnumerable<Budget>> GetVisibleForUserIdAsync(int userId)
    {
        await EnsureCurrentMonthlyBudgetAsync(userId);
        await ReconcileMandatoryExpensesForOwnerAsync(userId);
        return await _budgetRepository.GetVisibleForUserIdAsync(userId);
    }

    public async Task<Budget?> GetByIdForVisibleUserIdAsync(int id, int userId)
    {
        await ReconcileMandatoryExpensesForOwnerAsync(userId);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, userId);
    }

    public async Task<Budget?> GetByShareTokenForVisibleUserIdAsync(Guid token, int userId)
    {
        await ReconcileMandatoryExpensesForOwnerAsync(userId);
        return await _budgetRepository.GetByShareTokenForVisibleUserIdAsync(token, userId);
    }

    public async Task<Budget> AddAsync(BudgetDto dto, int ownerId)
    {
        Validate(dto);
        await EnsureMonthlySlotIsFree(dto, ownerId);
        var budget = await _budgetRepository.AddAsync(NewBudget(dto, ownerId));
        await ReconcileMandatoryExpensesForOwnerAsync(ownerId);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(budget.Id, ownerId) ?? budget;
    }

    public async Task<Budget?> UpdateAsync(int id, BudgetDto dto, int ownerId)
    {
        Validate(dto);
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return null;

        if (dto.Type == BudgetTypes.Monthly &&
            (budget.Type != dto.Type || budget.Year != dto.Year || budget.Month != dto.Month))
        {
            await EnsureMonthlySlotIsFree(dto, ownerId, id);
        }

        Apply(dto, budget);
        budget.UpdatedAt = DateTime.UtcNow;
        await _budgetRepository.UpdateAsync(budget);
        await ReconcileMandatoryExpensesForOwnerAsync(ownerId);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, ownerId);
    }

    public async Task<bool> DeleteForOwnerAsync(int id, int ownerId)
    {
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return false;
        await _budgetRepository.DeleteAsync(id);
        return true;
    }

    public async Task<Budget?> EnsureCurrentMonthlyBudgetAsync(int ownerId, DateTime? utcNow = null)
    {
        var now = (utcNow ?? DateTime.UtcNow).Date;
        var covering = await _budgetRepository.GetMonthlyCoveringDateForOwnerAsync(ownerId, now);
        if (covering != null)
            return covering;

        var current = await _budgetRepository.GetMonthlyForOwnerAsync(ownerId, now.Year, now.Month);
        if (current != null)
            return current;

        var source = await _budgetRepository.GetLatestRenewableMonthlyForOwnerAsync(ownerId, now.Year, now.Month);
        if (source == null)
            return null;

        var clone = CloneMonthlyBudget(source, ownerId, now.Year, now.Month);
        return await _budgetRepository.AddAsync(clone);
    }

    public async Task<IReadOnlyList<Budget>> PlanNextMonthsAsync(int id, int months, int ownerId)
    {
        if (months is < 1 or > 12)
            throw new ArgumentException("Planning horizon must be between 1 and 12 months.");

        var source = await _budgetRepository.GetByIdForOwnerIdAsync(id, ownerId);
        if (source == null)
            return Array.Empty<Budget>();
        if (source.Type != BudgetTypes.Monthly || source.Year == null || source.Month == null)
            throw new ArgumentException("Only monthly budgets can be planned ahead.");

        var start = new DateTime(source.Year.Value, source.Month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
        var result = new List<Budget>();

        for (var offset = 1; offset <= months; offset++)
        {
            var period = start.AddMonths(offset);
            var existing = await _budgetRepository.GetMonthlyForOwnerAsync(ownerId, period.Year, period.Month);
            if (existing != null)
            {
                result.Add(existing);
                continue;
            }

            var clone = CloneMonthlyBudget(source, ownerId, period.Year, period.Month);
            result.Add(await _budgetRepository.AddAsync(clone));
        }

        return result;
    }

    public async Task<Budget?> AddCategoryAsync(int id, BudgetCategoryDto dto, int ownerId) =>
        await AddChild(id, ownerId, b => b.Categories.Add(dto.ToEntity()));

    public async Task<Budget?> UpdateCategoryAsync(int id, int categoryId, BudgetCategoryDto dto, int ownerId)
    {
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return null;
        var category = budget.Categories.FirstOrDefault(x => x.Id == categoryId);
        if (category == null)
            return null;

        category.Name = dto.Name;
        category.Icon = dto.Icon;
        category.Color = dto.Color;
        category.Limit = dto.Limit;
        category.IsActive = dto.IsActive;
        category.Labels.Clear();
        foreach (var label in dto.Labels.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            category.Labels.Add(new BudgetCategoryLabel { Value = label.Trim().ToLowerInvariant() });
        }

        await _budgetRepository.UpdateAsync(budget);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, ownerId);
    }

    public async Task<Budget?> DeleteCategoryAsync(int id, int categoryId, int ownerId) =>
        await DeleteChild(id, ownerId, b => b.Categories.FirstOrDefault(x => x.Id == categoryId), (b, x) => b.Categories.Remove(x));

    public async Task<Budget?> AddIncomeSourceAsync(int id, BudgetIncomeSourceDto dto, int ownerId) =>
        await AddChild(id, ownerId, b => b.IncomeSources.Add(dto.ToEntity()));

    public async Task<Budget?> UpdateIncomeSourceAsync(int id, int itemId, BudgetIncomeSourceDto dto, int ownerId) =>
        await UpdateChild(id, ownerId, b => b.IncomeSources.FirstOrDefault(x => x.Id == itemId), x =>
        {
            x.Name = dto.Name;
            x.Amount = dto.Amount;
            x.Frequency = dto.Frequency;
            x.ExpectedDate = dto.ExpectedDate;
            x.IsReceived = dto.IsReceived;
        });

    public async Task<Budget?> DeleteIncomeSourceAsync(int id, int itemId, int ownerId) =>
        await DeleteChild(id, ownerId, b => b.IncomeSources.FirstOrDefault(x => x.Id == itemId), (b, x) => b.IncomeSources.Remove(x));

    public async Task<Budget?> AddMandatoryExpenseAsync(int id, BudgetMandatoryExpenseDto dto, int ownerId) =>
        await AddChild(id, ownerId, b => b.MandatoryExpenses.Add(dto.ToEntity()), reconcileMandatory: true);

    public async Task<Budget?> UpdateMandatoryExpenseAsync(int id, int itemId, BudgetMandatoryExpenseDto dto, int ownerId) =>
        await UpdateChild(id, ownerId, b => b.MandatoryExpenses.FirstOrDefault(x => x.Id == itemId), x =>
        {
            x.BudgetCategoryId = dto.BudgetCategoryId;
            x.Name = dto.Name;
            x.Amount = dto.Amount;
            x.DueDate = dto.DueDate;
            x.Frequency = dto.Frequency;
            x.MatchLabel = NormalizeLabel(dto.MatchLabel);
            x.IsPaid = dto.IsPaid;
        }, reconcileMandatory: true);

    public async Task<Budget?> DeleteMandatoryExpenseAsync(int id, int itemId, int ownerId) =>
        await DeleteChild(id, ownerId, b => b.MandatoryExpenses.FirstOrDefault(x => x.Id == itemId), (b, x) => b.MandatoryExpenses.Remove(x));

    public async Task<Budget?> AddPlannedExpenseAsync(int id, BudgetPlannedExpenseDto dto, int ownerId) =>
        await AddChild(id, ownerId, b => b.PlannedExpenses.Add(dto.ToEntity()));

    public async Task<Budget?> UpdatePlannedExpenseAsync(int id, int itemId, BudgetPlannedExpenseDto dto, int ownerId) =>
        await UpdateChild(id, ownerId, b => b.PlannedExpenses.FirstOrDefault(x => x.Id == itemId), x =>
        {
            x.BudgetCategoryId = dto.BudgetCategoryId;
            x.Name = dto.Name;
            x.Amount = dto.Amount;
            x.Date = dto.Date;
            x.IsPaid = dto.IsPaid;
            x.Notes = dto.Notes;
        });

    public async Task<Budget?> DeletePlannedExpenseAsync(int id, int itemId, int ownerId) =>
        await DeleteChild(id, ownerId, b => b.PlannedExpenses.FirstOrDefault(x => x.Id == itemId), (b, x) => b.PlannedExpenses.Remove(x));

    public async Task<Budget?> ShareWithUserAsync(int id, string email, int ownerId)
    {
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return null;

        var user = await _userRepository.GetByEmailAsync(email);
        if (user == null)
            throw new ArgumentException("User with this email was not found.");
        if (user.Id == ownerId)
            throw new ArgumentException("Budget owner already has access.");
        if (!budget.SharedUsers.Any(x => x.UserId == user.Id))
            budget.SharedUsers.Add(new BudgetSharedUser { UserId = user.Id });
        budget.SharingEnabled = true;
        budget.UpdatedAt = DateTime.UtcNow;
        await _budgetRepository.UpdateAsync(budget);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, ownerId);
    }

    public async Task<Budget?> RemoveSharedUserAsync(int id, int sharedUserId, int ownerId)
    {
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return null;
        var item = budget.SharedUsers.FirstOrDefault(s => s.UserId == sharedUserId);
        if (item != null)
            budget.SharedUsers.Remove(item);
        budget.UpdatedAt = DateTime.UtcNow;
        await _budgetRepository.UpdateAsync(budget);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, ownerId);
    }

    public async Task<Budget?> SetSharingAsync(int id, bool enabled, int ownerId, bool regenerateToken = false)
    {
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return null;
        budget.SharingEnabled = enabled;
        if (regenerateToken)
            budget.ShareToken = Guid.NewGuid();
        budget.UpdatedAt = DateTime.UtcNow;
        await _budgetRepository.UpdateAsync(budget);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, ownerId);
    }

    private async Task EnsureMonthlySlotIsFree(BudgetDto dto, int ownerId, int? exceptId = null)
    {
        if (dto.Type != BudgetTypes.Monthly || dto.Year == null || dto.Month == null)
            return;
        var existing = await _budgetRepository.GetMonthlyForOwnerAsync(ownerId, dto.Year.Value, dto.Month.Value);
        if (existing != null && existing.Id != exceptId)
            throw new ArgumentException("Monthly budget for this month already exists.");
    }

    private async Task<Budget?> AddChild(int id, int ownerId, Action<Budget> add, bool reconcileMandatory = false)
    {
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return null;
        add(budget);
        budget.UpdatedAt = DateTime.UtcNow;
        await _budgetRepository.UpdateAsync(budget);
        if (reconcileMandatory)
            await ReconcileMandatoryExpensesForOwnerAsync(ownerId);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, ownerId);
    }

    private async Task<Budget?> UpdateChild<T>(
        int id,
        int ownerId,
        Func<Budget, T?> find,
        Action<T> apply,
        bool reconcileMandatory = false)
        where T : class
    {
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return null;
        var item = find(budget);
        if (item == null)
            return null;
        apply(item);
        budget.UpdatedAt = DateTime.UtcNow;
        await _budgetRepository.UpdateAsync(budget);
        if (reconcileMandatory)
            await ReconcileMandatoryExpensesForOwnerAsync(ownerId);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, ownerId);
    }

    private async Task<Budget?> DeleteChild<T>(int id, int ownerId, Func<Budget, T?> find, Action<Budget, T> remove)
        where T : class
    {
        var budget = await _budgetRepository.GetTrackedByIdForOwnerIdAsync(id, ownerId);
        if (budget == null)
            return null;
        var item = find(budget);
        if (item == null)
            return null;
        remove(budget, item);
        budget.UpdatedAt = DateTime.UtcNow;
        await _budgetRepository.UpdateAsync(budget);
        return await _budgetRepository.GetByIdForVisibleUserIdAsync(id, ownerId);
    }

    private async Task ReconcileMandatoryExpensesForOwnerAsync(int ownerId)
    {
        var budgets = await _context.Budgets
            .Include(x => x.MandatoryExpenses)
            .Where(x => x.OwnerId == ownerId && x.MandatoryExpenses.Any())
            .ToListAsync();

        if (budgets.Count == 0)
            return;

        var earliest = budgets.Min(ResolvePeriodStart);
        var latest = budgets.Max(ResolvePeriodEnd).Date.AddDays(1).AddTicks(-1);
        var transactions = await _context.Transactions
            .Include(x => x.Tags)
            .Where(x => x.UserId == ownerId &&
                        x.Type == TransactionType.Expense &&
                        x.Date >= earliest &&
                        x.Date <= latest)
            .ToListAsync();

        var changed = false;
        foreach (var budget in budgets)
        {
            var start = ResolvePeriodStart(budget);
            var end = ResolvePeriodEnd(budget).Date.AddDays(1).AddTicks(-1);
            var periodTransactions = transactions.Where(x => x.Date >= start && x.Date <= end).ToList();

            foreach (var item in budget.MandatoryExpenses)
            {
                var label = NormalizeLabel(item.MatchLabel);
                var paidAmount = string.IsNullOrWhiteSpace(label)
                    ? 0m
                    : periodTransactions
                        .Where(x => x.Tags.Any(tag => NormalizeLabel(tag.Value) == label))
                        .Sum(x => x.Amount);
                var isPaid = paidAmount >= item.Amount;
                if (item.IsPaid == isPaid)
                    continue;
                item.IsPaid = isPaid;
                changed = true;
            }
        }

        if (changed)
            await _context.SaveChangesAsync();
    }

    private static Budget NewBudget(BudgetDto dto, int ownerId)
    {
        var budget = new Budget
        {
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow,
            ShareToken = Guid.NewGuid(),
        };
        Apply(dto, budget);
        return budget;
    }

    private static void Apply(BudgetDto dto, Budget budget)
    {
        budget.Type = dto.Type;
        budget.Name = dto.Name;
        budget.Currency = dto.Currency;
        budget.TotalLimit = dto.TotalLimit;
        budget.Month = dto.Month;
        budget.Year = dto.Year;
        budget.StartDate = ResolveDtoPeriodStart(dto);
        budget.EndDate = ResolveDtoPeriodEnd(dto);
        budget.TelegramEnabled = dto.TelegramEnabled;
        budget.WarningThreshold = dto.WarningThreshold;
        budget.AutoCreateNextMonthly = dto.AutoCreateNextMonthly;
        budget.SharingEnabled = dto.SharingEnabled;

        if (budget.Categories.Count == 0)
            foreach (var item in dto.Categories)
                budget.Categories.Add(item.ToEntity());
        if (budget.IncomeSources.Count == 0)
            foreach (var item in dto.IncomeSources)
                budget.IncomeSources.Add(item.ToEntity());
        if (budget.MandatoryExpenses.Count == 0)
            foreach (var item in dto.MandatoryExpenses)
                budget.MandatoryExpenses.Add(item.ToEntity());
        if (budget.PlannedExpenses.Count == 0)
            foreach (var item in dto.PlannedExpenses)
                budget.PlannedExpenses.Add(item.ToEntity());
    }

    private static Budget CloneMonthlyBudget(Budget source, int ownerId, int year, int month)
    {
        var offset = MonthOffset(source.Year, source.Month, year, month);
        var clone = new Budget
        {
            OwnerId = ownerId,
            Type = BudgetTypes.Monthly,
            Name = $"Бюджет на {month:D2}.{year}",
            Currency = source.Currency,
            TotalLimit = source.TotalLimit,
            Month = month,
            Year = year,
            StartDate = ShiftMonths(ResolvePeriodStart(source), offset),
            EndDate = ShiftMonths(ResolvePeriodEnd(source), offset),
            TelegramEnabled = source.TelegramEnabled,
            WarningThreshold = source.WarningThreshold,
            AutoCreateNextMonthly = source.AutoCreateNextMonthly,
            ShareToken = Guid.NewGuid(),
            SharingEnabled = false,
            CreatedAt = DateTime.UtcNow,
        };

        var categoryMap = new Dictionary<int, BudgetCategory>();
        foreach (var category in source.Categories)
        {
            var copied = new BudgetCategory
            {
                Name = category.Name,
                Icon = category.Icon,
                Color = category.Color,
                Limit = category.Limit,
                IsActive = category.IsActive,
                Labels = category.Labels.Select(x => new BudgetCategoryLabel { Value = x.Value }).ToList(),
            };
            clone.Categories.Add(copied);
            categoryMap[category.Id] = copied;
        }

        foreach (var income in source.IncomeSources)
        {
            clone.IncomeSources.Add(new BudgetIncomeSource
            {
                Name = income.Name,
                Amount = income.Amount,
                Frequency = income.Frequency,
                ExpectedDate = ShiftNullableMonths(income.ExpectedDate, offset),
                IsReceived = false,
            });
        }

        foreach (var item in source.MandatoryExpenses)
        {
            var copied = new BudgetMandatoryExpense
            {
                Name = item.Name,
                Amount = item.Amount,
                DueDate = ShiftNullableMonths(item.DueDate, offset),
                Frequency = item.Frequency,
                MatchLabel = item.MatchLabel,
                IsPaid = false,
            };
            if (item.BudgetCategoryId.HasValue && categoryMap.TryGetValue(item.BudgetCategoryId.Value, out var category))
                copied.Category = category;
            clone.MandatoryExpenses.Add(copied);
        }

        return clone;
    }

    private static DateTime ResolveDtoPeriodStart(BudgetDto dto)
    {
        if (dto.StartDate.HasValue)
            return dto.StartDate.Value.Date;
        if (dto.Type == BudgetTypes.Monthly && dto.Year.HasValue && dto.Month.HasValue)
            return new DateTime(dto.Year.Value, dto.Month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
        return DateTime.UtcNow.Date;
    }

    private static DateTime ResolveDtoPeriodEnd(BudgetDto dto)
    {
        if (dto.EndDate.HasValue)
            return dto.EndDate.Value.Date;
        var start = ResolveDtoPeriodStart(dto);
        if (dto.Type == BudgetTypes.Monthly && dto.Year.HasValue && dto.Month.HasValue)
            return new DateTime(dto.Year.Value, dto.Month.Value, DateTime.DaysInMonth(dto.Year.Value, dto.Month.Value), 0, 0, 0, DateTimeKind.Utc);
        return start;
    }

    private static DateTime ResolvePeriodStart(Budget budget)
    {
        if (budget.StartDate.HasValue)
            return budget.StartDate.Value.Date;
        if (budget.Year.HasValue && budget.Month.HasValue)
            return new DateTime(budget.Year.Value, budget.Month.Value, 1, 0, 0, 0, DateTimeKind.Utc);
        return budget.CreatedAt.Date;
    }

    private static DateTime ResolvePeriodEnd(Budget budget)
    {
        if (budget.EndDate.HasValue)
            return budget.EndDate.Value.Date;
        if (budget.Year.HasValue && budget.Month.HasValue)
            return new DateTime(budget.Year.Value, budget.Month.Value, DateTime.DaysInMonth(budget.Year.Value, budget.Month.Value), 0, 0, 0, DateTimeKind.Utc);
        return ResolvePeriodStart(budget);
    }

    private static int MonthOffset(int? sourceYear, int? sourceMonth, int targetYear, int targetMonth)
    {
        if (!sourceYear.HasValue || !sourceMonth.HasValue)
            return 0;
        return (targetYear * 12 + targetMonth) - (sourceYear.Value * 12 + sourceMonth.Value);
    }

    private static DateTime ShiftMonths(DateTime source, int months) => source.AddMonths(months);

    private static DateTime? ShiftNullableMonths(DateTime? source, int months) =>
        source.HasValue ? source.Value.AddMonths(months) : null;

    private static string NormalizeLabel(string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToLowerInvariant();

    private static void Validate(BudgetDto dto)
    {
        if (!BudgetTypes.IsValid(dto.Type))
            throw new ArgumentException("Invalid budget type.");
        if (dto.Type == BudgetTypes.Monthly && (dto.Month is < 1 or > 12 || dto.Year == null))
            throw new ArgumentException("Monthly budget requires month and year.");
        if (dto.StartDate.HasValue && dto.EndDate.HasValue && dto.EndDate.Value.Date < dto.StartDate.Value.Date)
            throw new ArgumentException("Budget end date cannot be earlier than start date.");
        if (dto.Type == BudgetTypes.Event && (dto.StartDate == null || dto.EndDate == null))
            throw new ArgumentException("Event budget requires a valid date range.");
    }
}
