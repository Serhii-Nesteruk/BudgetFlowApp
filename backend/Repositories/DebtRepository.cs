using BudgetFlowAPi.Data;
using BudgetFlowAPi.Models;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Repositories;

public class DebtRepository : Repository<Debt>, IDebtRepository
{
    private readonly AppDbContext _context;

    public DebtRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Debt>> GetByUserIdAsync(int userId)
    {
        return await _context.Debts
            .Where(d => d.UserId == userId)
            .Include(d => d.PaymentHistory)
            .Include(d => d.InstallmentSchedule)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<Debt?> GetByIdForUserIdAsync(int id, int userId)
    {
        return await _context.Debts
            .Where(d => d.Id == id && d.UserId == userId)
            .Include(d => d.PaymentHistory)
            .Include(d => d.InstallmentSchedule)
            .FirstOrDefaultAsync();
    }
}
