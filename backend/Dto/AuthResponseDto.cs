namespace BudgetFlowAPi.DTO;

public sealed class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}
