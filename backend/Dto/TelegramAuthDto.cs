using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.DTO;

public sealed class TelegramWebAppAuthRequestDto
{
    [Required]
    public string InitData { get; set; } = string.Empty;
}
