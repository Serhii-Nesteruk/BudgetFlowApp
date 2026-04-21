using BudgetFlowAPi.Models;
using BudgetFlowAPi.Data;
using Microsoft.EntityFrameworkCore;

namespace BudgetFlowAPi.Repositories;

public class TransactionRepository : Repository<Transaction>, ITransactionRepository
{
    private readonly AppDbContext _context;
    public TransactionRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Transaction>> GetByCounterpartyAsync(string counterparty)
    {
        return await _context.Transactions.Where(t => t.Counterparty == counterparty).ToListAsync();
    }

    public async Task<IEnumerable<Transaction>> GetByUserIdAsync(int userId)
    {
        return await _context.Transactions.Where(t => t.UserId == userId).ToListAsync();
    }

    public async Task<Transaction?> GetByIdForUserIdAsync(int id, int userId)
    {
        return await _context.Transactions.Where(t => t.Id == id && t.UserId == userId).FirstOrDefaultAsync();  
    }
}
