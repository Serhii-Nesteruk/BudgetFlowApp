using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.DTO;

public class DebtDto
{
    public int Id
    {
        get; set;
    }

    [Required]
    [MaxLength(20)]
    public string Direction { get; set; } = "payable";

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "one-time";

    [Required]
    [StringLength(255)]
    public string Creditor { get; set; } = string.Empty;

    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount
    {
        get; set;
    }

    public decimal Remaining
    {
        get; set;
    }

    [Required]
    [MaxLength(5)]
    public string Currency { get; set; } = "UAH";

    [Required]
    public DateTime DueDate
    {
        get; set;
    }

    [Range(1, 5)]
    public int Priority { get; set; } = 3;

    public string Notes { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int? TotalInstallments
    {
        get; set;
    }
    public int? PaidInstallments
    {
        get; set;
    }
    public decimal? MonthlyPayment
    {
        get; set;
    }
    public DateTime? StartDate
    {
        get; set;
    }
    public int? RecurringDay
    {
        get; set;
    }
    public string? RecurringPeriod
    {
        get; set;
    }
    public DateTime CreatedAt
    {
        get; set;
    }
    public DateTime? UpdatedAt
    {
        get; set;
    }

    public List<DebtPaymentDto> PaymentHistory { get; set; } = [];
    public List<DebtInstallmentDto> InstallmentSchedule { get; set; } = [];
}

public class DebtPaymentDto
{
    public int Id
    {
        get; set;
    }
    public DateTime Date
    {
        get; set;
    }
    public decimal Amount
    {
        get; set;
    }
    public string Note { get; set; } = string.Empty;
}

public class DebtInstallmentDto
{
    public int Id
    {
        get; set;
    }
    public int Index
    {
        get; set;
    }
    public DateTime Date
    {
        get; set;
    }
    public decimal Amount
    {
        get; set;
    }
    public bool Paid
    {
        get; set;
    }
}
