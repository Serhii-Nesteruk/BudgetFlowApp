namespace BudgetFlowAPi.Models;

public static class DebtDirections
{
    public const string Payable = "payable";
    public const string Receivable = "receivable";

    public static bool IsValid(string value) => value is Payable or Receivable;
}

public static class DebtTypes
{
    public const string OneTime = "one-time";
    public const string Installment = "installment";
    public const string Recurring = "recurring";

    public static bool IsValid(string value) => value is OneTime or Installment or Recurring;
}

public static class DebtStatuses
{
    public const string Unpaid = "unpaid";
    public const string Overdue = "overdue";
    public const string Partial = "partial";
    public const string Paid = "paid";
}
