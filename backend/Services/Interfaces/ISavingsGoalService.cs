using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Services;

public interface ISavingsGoalService : ICrudService<SavingsGoal>
{
    Task<IEnumerable<SavingsGoal>> GetByUserIdAsync(int userId);
    Task<SavingsGoal?> GetByIdForUserIdAsync(int id, int userId);
    Task<SavingsGoal> AddAsync(SavingsGoalDto dto, int userId);
    Task<SavingsGoal?> UpdateAsync(int id, SavingsGoalDto dto, int userId);
    Task<bool> DeleteForUserAsync(int id, int userId);
    Task<SavingsGoal?> AddEntryAsync(int id, SavingsEntryDto dto, int userId);
    Task<SavingsGoal?> DeleteEntryAsync(int id, int entryId, int userId);
}
