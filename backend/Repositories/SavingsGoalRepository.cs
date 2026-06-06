using BudgetFlowAPi.Data;
using BudgetFlowAPi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Repositories;

public class SavingsGoalRepository : Repository<SavingsGoal>, ISavingsGoalRepository
{
    private readonly AppDbContext _context;

    public SavingsGoalRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    private IQueryable<SavingsGoal> Full() => _context.SavingsGoals
        .Include(x => x.Tags)
        .Include(x => x.Entries);

    public async Task<IEnumerable<SavingsGoal>> GetByUserIdAsync(int userId) =>
        await Full()
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

    public async Task<SavingsGoal?> GetByIdForUserIdAsync(int id, int userId) =>
        await Full()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

    public async Task<SavingsGoal?> GetTrackedByIdForUserIdAsync(int id, int userId) =>
        await Full()
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
}
