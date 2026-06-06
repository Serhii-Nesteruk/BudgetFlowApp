using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Repositories;

public interface ISavingsGoalRepository : IRepository<SavingsGoal>
{
    Task<IEnumerable<SavingsGoal>> GetByUserIdAsync(int userId);
    Task<SavingsGoal?> GetByIdForUserIdAsync(int id, int userId);
    Task<SavingsGoal?> GetTrackedByIdForUserIdAsync(int id, int userId);
}
