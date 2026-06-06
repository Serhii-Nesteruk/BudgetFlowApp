namespace BudgetFlowAPi.Models;
public static class BudgetTypes
{
    public const string Monthly = "monthly";
    public const string Event = "event";
    public static bool IsValid(string value) => value is Monthly or Event;
}
