using System.ComponentModel.DataAnnotations;

namespace BudgetFlowAPi.DTO;

public class BudgetDto
{
    public int Id
    {
        get; set;
    }
    [Required, MaxLength(20)] public string Type { get; set; } = "monthly";
    [Required, MaxLength(255)] public string Name { get; set; } = string.Empty;
    [Required, MaxLength(5)] public string Currency { get; set; } = "PLN";
    [Range(0, double.MaxValue)]
    public decimal TotalLimit
    {
        get; set;
    }
    public int? Month
    {
        get; set;
    }
    public int? Year
    {
        get; set;
    }
    public DateTime? StartDate
    {
        get; set;
    }
    public DateTime? EndDate
    {
        get; set;
    }
    public bool TelegramEnabled
    {
        get; set;
    }
    [Range(1, 100)] public int WarningThreshold { get; set; } = 80;
    public bool AutoCreateNextMonthly { get; set; } = true;
    public Guid ShareToken
    {
        get; set;
    }
    public bool SharingEnabled
    {
        get; set;
    }
    public List<BudgetCategoryDto> Categories { get; set; } = [];
    public List<BudgetIncomeSourceDto> IncomeSources { get; set; } = [];
    public List<BudgetMandatoryExpenseDto> MandatoryExpenses { get; set; } = [];
    public List<BudgetPlannedExpenseDto> PlannedExpenses { get; set; } = [];
    public List<BudgetSharedUserDto> SharedUsers { get; set; } = [];
}

public class BudgetCategoryDto
{
    public int Id
    {
        get; set;
    }
    [Required, MaxLength(120)] public string Name { get; set; } = string.Empty;
    [MaxLength(30)] public string Icon { get; set; } = string.Empty;
    [MaxLength(30)] public string Color { get; set; } = string.Empty;
    [Range(0, double.MaxValue)]
    public decimal Limit
    {
        get; set;
    }
    public bool IsActive { get; set; } = true;
    public List<string> Labels { get; set; } = [];
}

public class BudgetIncomeSourceDto
{
    public int Id
    {
        get; set;
    }
    [Required, MaxLength(160)] public string Name { get; set; } = string.Empty;
    [Range(0, double.MaxValue)]
    public decimal Amount
    {
        get; set;
    }
    [MaxLength(120)] public string Frequency { get; set; } = string.Empty;
    public DateTime? ExpectedDate
    {
        get; set;
    }
    public bool IsReceived
    {
        get; set;
    }
}

public class BudgetMandatoryExpenseDto
{
    public int Id
    {
        get; set;
    }
    public int? BudgetCategoryId
    {
        get; set;
    }
    [Required, MaxLength(160)] public string Name { get; set; } = string.Empty;
    [Range(0, double.MaxValue)]
    public decimal Amount
    {
        get; set;
    }
    public DateTime? DueDate
    {
        get; set;
    }
    [MaxLength(120)] public string Frequency { get; set; } = string.Empty;
    [MaxLength(120)] public string MatchLabel { get; set; } = string.Empty;
    public bool IsPaid
    {
        get; set;
    }
}

public class BudgetPlannedExpenseDto
{
    public int Id
    {
        get; set;
    }
    public int? BudgetCategoryId
    {
        get; set;
    }
    [Required, MaxLength(160)] public string Name { get; set; } = string.Empty;
    [Range(0, double.MaxValue)]
    public decimal Amount
    {
        get; set;
    }
    [Required]
    public DateTime Date
    {
        get; set;
    }
    public bool IsPaid
    {
        get; set;
    }
    public string Notes { get; set; } = string.Empty;
}

public class BudgetSharedUserDto
{
    public int UserId
    {
        get; set;
    }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class ShareBudgetUserDto
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
}

public class BudgetPlanNextMonthsDto
{
    [Range(1, 12)] public int Months { get; set; } = 3;
}
