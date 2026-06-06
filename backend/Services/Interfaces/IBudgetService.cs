using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Services;

public interface IBudgetService : ICrudService<Budget>
{
    Task<IEnumerable<Budget>> GetVisibleForUserIdAsync(int userId);
    Task<Budget?> GetByIdForVisibleUserIdAsync(int id, int userId);
    Task<Budget?> GetByShareTokenForVisibleUserIdAsync(Guid token, int userId);
    Task<Budget> AddAsync(BudgetDto dto, int ownerId);
    Task<Budget?> UpdateAsync(int id, BudgetDto dto, int ownerId);
    Task<bool> DeleteForOwnerAsync(int id, int ownerId);
    Task<Budget?> AddCategoryAsync(int id, BudgetCategoryDto dto, int ownerId);
    Task<Budget?> UpdateCategoryAsync(int id, int categoryId, BudgetCategoryDto dto, int ownerId);
    Task<Budget?> DeleteCategoryAsync(int id, int categoryId, int ownerId);
    Task<Budget?> AddIncomeSourceAsync(int id, BudgetIncomeSourceDto dto, int ownerId);
    Task<Budget?> UpdateIncomeSourceAsync(int id, int itemId, BudgetIncomeSourceDto dto, int ownerId);
    Task<Budget?> DeleteIncomeSourceAsync(int id, int itemId, int ownerId);
    Task<Budget?> AddMandatoryExpenseAsync(int id, BudgetMandatoryExpenseDto dto, int ownerId);
    Task<Budget?> UpdateMandatoryExpenseAsync(int id, int itemId, BudgetMandatoryExpenseDto dto, int ownerId);
    Task<Budget?> DeleteMandatoryExpenseAsync(int id, int itemId, int ownerId);
    Task<Budget?> AddPlannedExpenseAsync(int id, BudgetPlannedExpenseDto dto, int ownerId);
    Task<Budget?> UpdatePlannedExpenseAsync(int id, int itemId, BudgetPlannedExpenseDto dto, int ownerId);
    Task<Budget?> DeletePlannedExpenseAsync(int id, int itemId, int ownerId);
    Task<Budget?> ShareWithUserAsync(int id, string email, int ownerId);
    Task<Budget?> RemoveSharedUserAsync(int id, int sharedUserId, int ownerId);
    Task<Budget?> SetSharingAsync(int id, bool enabled, int ownerId, bool regenerateToken = false);
    Task<Budget?> EnsureCurrentMonthlyBudgetAsync(int ownerId, DateTime? utcNow = null);
    Task<IReadOnlyList<Budget>> PlanNextMonthsAsync(int id, int months, int ownerId);
}
