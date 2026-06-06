using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Repositories;

public interface IDebtRepository : IRepository<Debt>
{
    Task<IEnumerable<Debt>> GetByUserIdAsync(int userId);
    Task<Debt?> GetByIdForUserIdAsync(int id, int userId);
}
