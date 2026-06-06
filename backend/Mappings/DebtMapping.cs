using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Mappings;

public static class DebtMapping
{
    public static Debt ToEntity(this DebtDto dto)
    {
        return new Debt
        {
            Direction = dto.Direction,
            Type = dto.Type,
            Creditor = dto.Creditor,
            Amount = dto.Amount,
            Currency = dto.Currency,
            DueDate = dto.DueDate,
            Priority = dto.Priority,
            Notes = dto.Notes,
            TotalInstallments = dto.TotalInstallments,
            PaidInstallments = dto.PaidInstallments,
            MonthlyPayment = dto.MonthlyPayment,
            StartDate = dto.StartDate,
            RecurringDay = dto.RecurringDay,
            RecurringPeriod = dto.RecurringPeriod
        };
    }

    public static void Apply(this DebtDto dto, Debt debt)
    {
        debt.Direction = dto.Direction;
        debt.Type = dto.Type;
        debt.Creditor = dto.Creditor;
        debt.Amount = dto.Amount;
        debt.Currency = dto.Currency;
        debt.DueDate = dto.DueDate;
        debt.Priority = dto.Priority;
        debt.Notes = dto.Notes;
        debt.TotalInstallments = dto.TotalInstallments;
        debt.PaidInstallments = dto.PaidInstallments;
        debt.MonthlyPayment = dto.MonthlyPayment;
        debt.StartDate = dto.StartDate;
        debt.RecurringDay = dto.RecurringDay;
        debt.RecurringPeriod = dto.RecurringPeriod;
    }

    public static IEnumerable<DebtDto> ToDtoList(this IEnumerable<Debt> debts)
    {
        return debts.Select(d => d.ToDto());
    }

    public static DebtDto ToDto(this Debt debt)
    {
        return new DebtDto
        {
            Id = debt.Id,
            Direction = debt.Direction,
            Type = debt.Type,
            Creditor = debt.Creditor,
            Amount = debt.Amount,
            Remaining = debt.Remaining,
            Currency = debt.Currency,
            DueDate = debt.DueDate,
            Status = debt.Status,
            Priority = debt.Priority,
            Notes = debt.Notes,
            TotalInstallments = debt.TotalInstallments,
            PaidInstallments = debt.PaidInstallments,
            MonthlyPayment = debt.MonthlyPayment,
            StartDate = debt.StartDate,
            RecurringDay = debt.RecurringDay,
            RecurringPeriod = debt.RecurringPeriod,
            CreatedAt = debt.CreatedAt,
            UpdatedAt = debt.UpdatedAt,
            PaymentHistory = debt.PaymentHistory
                .OrderBy(p => p.Date)
                .Select(p => new DebtPaymentDto
                {
                    Id = p.Id,
                    Date = p.Date,
                    Amount = p.Amount,
                    Note = p.Note
                })
                .ToList(),
            InstallmentSchedule = debt.InstallmentSchedule
                .OrderBy(i => i.Index)
                .Select(i => new DebtInstallmentDto
                {
                    Id = i.Id,
                    Index = i.Index,
                    Date = i.Date,
                    Amount = i.Amount,
                    Paid = i.Paid
                })
                .ToList()
        };
    }
}
