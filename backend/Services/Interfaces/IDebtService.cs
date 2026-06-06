using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Services;

public interface IDebtService : ICrudService<Debt>
{
    Task<IEnumerable<Debt>> GetByUserIdAsync(int userId);
    Task<Debt?> GetByIdForUserIdAsync(int id, int userId);
    Task<Debt> AddAsync(DebtDto dto, int userId);
    Task<Debt?> UpdateAsync(int id, DebtDto dto, int userId);
    Task<Debt?> AddPaymentAsync(int id, DebtPaymentRequestDto dto, int userId);
    Task<Debt?> MarkPaidAsync(int id, int userId);
    Task<Debt?> AddRecurringChargeAsync(int id, RecurringDebtChargeDto dto, int userId);
}
