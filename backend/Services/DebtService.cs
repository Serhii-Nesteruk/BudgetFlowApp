using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Mappings;
using BudgetFlowAPi.Models;
using BudgetFlowAPi.Repositories;

namespace BudgetFlowAPi.Services;

public class DebtService : CrudService<Debt>, IDebtService
{
    private readonly IDebtRepository _debtRepository;

    public DebtService(IDebtRepository debtRepository) : base(debtRepository)
    {
        _debtRepository = debtRepository;
    }

    public async Task<IEnumerable<Debt>> GetByUserIdAsync(int userId)
    {
        return await _debtRepository.GetByUserIdAsync(userId);
    }

    public async Task<Debt?> GetByIdForUserIdAsync(int id, int userId)
    {
        return await _debtRepository.GetByIdForUserIdAsync(id, userId);
    }

    public async Task<Debt> AddAsync(DebtDto dto, int userId)
    {
        Validate(dto);

        var debt = dto.ToEntity();
        debt.UserId = userId;
        debt.CreatedAt = DateTime.UtcNow;
        debt.Remaining = CalculateInitialRemaining(debt);
        debt.Status = CalculateStatus(debt);

        if (debt.Type == DebtTypes.Installment)
        {
            debt.InstallmentSchedule = GenerateInstallments(debt);
        }

        return await _debtRepository.AddAsync(debt);
    }

    public async Task<Debt?> UpdateAsync(int id, DebtDto dto, int userId)
    {
        Validate(dto);

        var debt = await GetByIdForUserIdAsync(id, userId);
        if (debt == null)
        {
            return null;
        }

        var scheduleShouldBeRegenerated = ShouldRegenerateSchedule(debt, dto);
        dto.Apply(debt);

        if (debt.Type == DebtTypes.Installment && scheduleShouldBeRegenerated)
        {
            debt.InstallmentSchedule.Clear();
            debt.InstallmentSchedule = GenerateInstallments(debt);
        }
        else if (debt.Type != DebtTypes.Installment)
        {
            debt.InstallmentSchedule.Clear();
            debt.TotalInstallments = null;
            debt.PaidInstallments = null;
            debt.MonthlyPayment = null;
            debt.StartDate = null;
        }

        debt.Status = CalculateStatus(debt);
        debt.UpdatedAt = DateTime.UtcNow;
        await _debtRepository.UpdateAsync(debt);
        return debt;
    }

    public async Task<Debt?> AddPaymentAsync(int id, DebtPaymentRequestDto dto, int userId)
    {
        var debt = await GetByIdForUserIdAsync(id, userId);
        if (debt == null)
        {
            return null;
        }

        if (dto.Amount <= 0 || dto.Amount > debt.Remaining)
        {
            throw new ArgumentException("Payment amount must be greater than zero and must not exceed the remaining amount.");
        }

        debt.PaymentHistory.Add(new DebtPayment
        {
            Date = dto.Date,
            Amount = dto.Amount,
            Note = dto.Note,
            CreatedAt = DateTime.UtcNow
        });

        debt.Remaining = Math.Max(0, debt.Remaining - dto.Amount);
        MarkNextInstallmentAsPaid(debt);
        debt.Status = CalculateStatus(debt);
        debt.UpdatedAt = DateTime.UtcNow;

        await _debtRepository.UpdateAsync(debt);
        return debt;
    }

    public async Task<Debt?> MarkPaidAsync(int id, int userId)
    {
        var debt = await GetByIdForUserIdAsync(id, userId);
        if (debt == null)
        {
            return null;
        }

        if (debt.Remaining > 0)
        {
            debt.PaymentHistory.Add(new DebtPayment
            {
                Date = DateTime.UtcNow,
                Amount = debt.Remaining,
                Note = debt.Direction == DebtDirections.Receivable
                    ? "Позначено як повернено"
                    : "Позначено як оплачено",
                CreatedAt = DateTime.UtcNow
            });
        }

        foreach (var installment in debt.InstallmentSchedule)
        {
            installment.Paid = true;
        }

        debt.PaidInstallments = debt.TotalInstallments;
        debt.Remaining = 0;
        debt.Status = DebtStatuses.Paid;
        debt.UpdatedAt = DateTime.UtcNow;

        await _debtRepository.UpdateAsync(debt);
        return debt;
    }

    public async Task<Debt?> AddRecurringChargeAsync(int id, RecurringDebtChargeDto dto, int userId)
    {
        var debt = await GetByIdForUserIdAsync(id, userId);
        if (debt == null)
        {
            return null;
        }

        if (debt.Type != DebtTypes.Recurring)
        {
            throw new ArgumentException("A recurring charge can only be added to a recurring debt.");
        }

        debt.Amount = dto.Amount;
        debt.Remaining = dto.Amount;
        debt.DueDate = dto.DueDate;
        debt.Notes = string.IsNullOrWhiteSpace(dto.Note) ? debt.Notes : dto.Note;
        debt.Status = CalculateStatus(debt);
        debt.UpdatedAt = DateTime.UtcNow;

        await _debtRepository.UpdateAsync(debt);
        return debt;
    }

    private static void Validate(DebtDto dto)
    {
        if (!DebtDirections.IsValid(dto.Direction))
        {
            throw new ArgumentException("Invalid debt direction.");
        }

        if (!DebtTypes.IsValid(dto.Type))
        {
            throw new ArgumentException("Invalid debt type.");
        }

        if (dto.Type == DebtTypes.Installment &&
            (dto.TotalInstallments is null or <= 0 || dto.MonthlyPayment is null or <= 0 || dto.StartDate == null))
        {
            throw new ArgumentException("Installment debt requires total installments, monthly payment and start date.");
        }

        if (dto.Type == DebtTypes.Recurring && dto.RecurringDay is not null && (dto.RecurringDay < 1 || dto.RecurringDay > 31))
        {
            throw new ArgumentException("Recurring day must be between 1 and 31.");
        }
    }

    private static decimal CalculateInitialRemaining(Debt debt)
    {
        if (debt.Type != DebtTypes.Installment)
        {
            return debt.Amount;
        }

        return Math.Max(0, debt.Amount - (debt.PaidInstallments ?? 0) * (debt.MonthlyPayment ?? 0));
    }

    private static string CalculateStatus(Debt debt)
    {
        if (debt.Remaining <= 0)
        {
            return DebtStatuses.Paid;
        }

        if (debt.DueDate.Date < DateTime.UtcNow.Date)
        {
            return DebtStatuses.Overdue;
        }

        if (debt.Remaining < debt.Amount)
        {
            return DebtStatuses.Partial;
        }

        return DebtStatuses.Unpaid;
    }

    private static bool ShouldRegenerateSchedule(Debt debt, DebtDto dto)
    {
        return debt.Type != dto.Type ||
               debt.TotalInstallments != dto.TotalInstallments ||
               debt.MonthlyPayment != dto.MonthlyPayment ||
               debt.StartDate != dto.StartDate;
    }

    private static ICollection<DebtInstallment> GenerateInstallments(Debt debt)
    {
        var result = new List<DebtInstallment>();
        var startDate = debt.StartDate ?? DateTime.UtcNow;
        var totalInstallments = debt.TotalInstallments ?? 0;
        var paidInstallments = debt.PaidInstallments ?? 0;
        var monthlyPayment = debt.MonthlyPayment ?? 0;

        for (var index = 0; index < totalInstallments; index++)
        {
            result.Add(new DebtInstallment
            {
                Index = index + 1,
                Date = startDate.AddMonths(index + 1),
                Amount = monthlyPayment,
                Paid = index < paidInstallments
            });
        }

        return result;
    }

    private static void MarkNextInstallmentAsPaid(Debt debt)
    {
        if (debt.Type != DebtTypes.Installment)
        {
            return;
        }

        var nextInstallment = debt.InstallmentSchedule
            .OrderBy(i => i.Index)
            .FirstOrDefault(i => !i.Paid);

        if (nextInstallment == null)
        {
            return;
        }

        nextInstallment.Paid = true;
        debt.PaidInstallments = (debt.PaidInstallments ?? 0) + 1;
    }
}
