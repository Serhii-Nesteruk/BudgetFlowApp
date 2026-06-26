using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> AuthenticateAsync(LoginRequestDto loginRequest);
    Task<AuthResponseDto?> AuthenticateTelegramWebAppAsync(string initData);
    Task<User> RegisterAsync(RegisterRequestDto registerRequest);
    Task<AuthResponseDto?> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}
