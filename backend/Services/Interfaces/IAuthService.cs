using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Services;

public interface IAuthService
{
    Task<string> AuthenticateAsync(LoginRequestDto loginRequest);
    Task<User> RegisterAsync(RegisterRequestDto registerRequest);
}