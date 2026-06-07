using BudgetFlowAPi.Data;
using BudgetFlowAPi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Repositories;

public class BudgetRepository : Repository<Budget>, IBudgetRepository
{
    private readonly AppDbContext _context;

    public BudgetRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    private IQueryable<Budget> Full() => _context.Budgets
        .Include(b => b.Categories).ThenInclude(c => c.Labels)
        .Include(b => b.IncomeSources)
        .Include(b => b.MandatoryExpenses)
        .Include(b => b.PlannedExpenses)
        .Include(b => b.SharedUsers).ThenInclude(s => s.User);

    public async Task<IEnumerable<Budget>> GetVisibleForUserIdAsync(int userId) =>
        await Full()
            .AsNoTracking()
            .Where(b => b.OwnerId == userId || b.SharedUsers.Any(s => s.UserId == userId))
            .OrderByDescending(b => b.Year)
            .ThenByDescending(b => b.Month)
            .ThenByDescending(b => b.CreatedAt)
            .ToListAsync();

    public async Task<Budget?> GetByIdForOwnerIdAsync(int id, int ownerId) =>
        await Full().AsNoTracking().FirstOrDefaultAsync(b => b.Id == id && b.OwnerId == ownerId);

    public async Task<Budget?> GetTrackedByIdForOwnerIdAsync(int id, int ownerId) =>
        await Full().FirstOrDefaultAsync(b => b.Id == id && b.OwnerId == ownerId);

    public async Task<Budget?> GetByIdForVisibleUserIdAsync(int id, int userId) =>
        await Full().AsNoTracking().FirstOrDefaultAsync(b =>
            b.Id == id && (b.OwnerId == userId || b.SharedUsers.Any(s => s.UserId == userId)));

    public async Task<Budget?> GetByShareTokenForVisibleUserIdAsync(Guid token, int userId) =>
        await Full().AsNoTracking().FirstOrDefaultAsync(b =>
            b.ShareToken == token && b.SharingEnabled &&
            (b.OwnerId == userId || b.SharedUsers.Any(s => s.UserId == userId)));

    public async Task<Budget?> GetMonthlyForOwnerAsync(int ownerId, int year, int month) =>
        await Full().AsNoTracking().FirstOrDefaultAsync(b =>
            b.OwnerId == ownerId && b.Type == BudgetTypes.Monthly && b.Year == year && b.Month == month);

    public async Task<Budget?> GetMonthlyCoveringDateForOwnerAsync(int ownerId, DateTime date) =>
        await Full().AsNoTracking().FirstOrDefaultAsync(b =>
            b.OwnerId == ownerId &&
            b.Type == BudgetTypes.Monthly &&
            b.StartDate.HasValue &&
            b.EndDate.HasValue &&
            b.StartDate.Value <= date &&
            b.EndDate.Value >= date);

    public async Task<Budget?> GetLatestRenewableMonthlyForOwnerAsync(int ownerId, int beforeYear, int beforeMonth) =>
        await Full()
            .AsNoTracking()
            .Where(b => b.OwnerId == ownerId &&
                        b.Type == BudgetTypes.Monthly &&
                        b.AutoCreateNextMonthly &&
                        b.Year.HasValue && b.Month.HasValue &&
                        (b.Year < beforeYear || (b.Year == beforeYear && b.Month < beforeMonth)))
            .OrderByDescending(b => b.Year)
            .ThenByDescending(b => b.Month)
            .FirstOrDefaultAsync();
}
