namespace BudgetFlowAPi.DTO;

public sealed class LogoutRequestDto
{
    public string RefreshToken { get; set; } = string.Empty;
}
