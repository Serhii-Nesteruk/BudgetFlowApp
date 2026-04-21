using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Services;

public interface ITransactionService : ICrudService<Transaction>
{
    Task<IEnumerable<Transaction>> GetByCounterpartyAsync(string counterparty);
    Task<IEnumerable<Transaction>> GetByUserIdAsync(int userId);
    Task<Transaction?> GetByIdForUserIdAsync(int id, int userId);
}