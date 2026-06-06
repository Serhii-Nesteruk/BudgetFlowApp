using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.DTO;

public class DebtPaymentRequestDto
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public string Note { get; set; } = string.Empty;
}

public class RecurringDebtChargeDto
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    public string Note { get; set; } = string.Empty;
}
