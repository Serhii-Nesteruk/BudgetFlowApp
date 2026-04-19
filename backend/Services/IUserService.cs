using BudgetFlowAPi.Models;
using BudgetFlowAPi.DTO;

namespace BudgetFlowAPi.Services;

public interface IUserService : ICrudService<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User> RegisterAsync(RegisterRequestDto registerRequest);
    
}