using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Repositories;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<IEnumerable<Transaction>> GetByReceiverAsync(string receiver);
    Task<IEnumerable<Transaction>> GetByUserIdAsync(int userId);
    Task<Transaction?> GetByIdForUserIdAsync(int id, int userId);
}