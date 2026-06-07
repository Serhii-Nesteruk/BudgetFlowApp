using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Repositories;

public interface IBudgetRepository : IRepository<Budget>
{
    Task<IEnumerable<Budget>> GetVisibleForUserIdAsync(int userId);
    Task<Budget?> GetByIdForOwnerIdAsync(int id, int ownerId);
    Task<Budget?> GetByIdForVisibleUserIdAsync(int id, int userId);
    Task<Budget?> GetByShareTokenForVisibleUserIdAsync(Guid token, int userId);
    Task<Budget?> GetTrackedByIdForOwnerIdAsync(int id, int ownerId);
    Task<Budget?> GetMonthlyForOwnerAsync(int ownerId, int year, int month);
    Task<Budget?> GetMonthlyCoveringDateForOwnerAsync(int ownerId, DateTime date);
    Task<Budget?> GetLatestRenewableMonthlyForOwnerAsync(int ownerId, int beforeYear, int beforeMonth);
}
