using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Mappings;
using BudgetFlowAPi.Models;
using BudgetFlowAPi.Repositories;

namespace BudgetFlowAPi.Services;

public class SavingsGoalService : CrudService<SavingsGoal>, ISavingsGoalService
{
    private readonly ISavingsGoalRepository _repository;

    public SavingsGoalService(ISavingsGoalRepository repository) : base(repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<SavingsGoal>> GetByUserIdAsync(int userId) =>
        _repository.GetByUserIdAsync(userId);

    public Task<SavingsGoal?> GetByIdForUserIdAsync(int id, int userId) =>
        _repository.GetByIdForUserIdAsync(id, userId);

    public Task<SavingsGoal> AddAsync(SavingsGoalDto dto, int userId)
    {
        Validate(dto);
        return _repository.AddAsync(dto.ToEntity(userId));
    }

    public async Task<SavingsGoal?> UpdateAsync(int id, SavingsGoalDto dto, int userId)
    {
        Validate(dto);
        var goal = await _repository.GetTrackedByIdForUserIdAsync(id, userId);
        if (goal == null)
            return null;

        goal.Name = dto.Name.Trim();
        goal.Description = dto.Description.Trim();
        goal.TargetAmount = dto.TargetAmount;
        goal.Currency = dto.Currency.Trim().ToUpperInvariant();
        goal.Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "🫙" : dto.Icon.Trim();
        goal.UpdatedAt = DateTime.UtcNow;

        goal.Tags.Clear();
        foreach (var tag in SavingsGoalMapping.NormalizeTags(dto.Tags))
        {
            goal.Tags.Add(new SavingsGoalTag { Value = tag });
        }

        await _repository.UpdateAsync(goal);
        return await _repository.GetByIdForUserIdAsync(id, userId);
    }

    public async Task<bool> DeleteForUserAsync(int id, int userId)
    {
        var goal = await _repository.GetTrackedByIdForUserIdAsync(id, userId);
        if (goal == null)
            return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<SavingsGoal?> AddEntryAsync(int id, SavingsEntryDto dto, int userId)
    {
        if (dto.Amount <= 0)
            throw new ArgumentException("Savings entry amount must be greater than zero.");
        var goal = await _repository.GetTrackedByIdForUserIdAsync(id, userId);
        if (goal == null)
            return null;

        goal.Entries.Add(dto.ToEntity(goal.Currency));
        goal.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(goal);
        return await _repository.GetByIdForUserIdAsync(id, userId);
    }

    public async Task<SavingsGoal?> DeleteEntryAsync(int id, int entryId, int userId)
    {
        var goal = await _repository.GetTrackedByIdForUserIdAsync(id, userId);
        if (goal == null)
            return null;

        var entry = goal.Entries.FirstOrDefault(x => x.Id == entryId);
        if (entry == null)
            return null;

        goal.Entries.Remove(entry);
        goal.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(goal);
        return await _repository.GetByIdForUserIdAsync(id, userId);
    }

    private static void Validate(SavingsGoalDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("Savings goal name is required.");
        if (string.IsNullOrWhiteSpace(dto.Currency))
            throw new ArgumentException("Savings goal currency is required.");
        if (dto.TargetAmount is <= 0)
            throw new ArgumentException("Target amount must be greater than zero.");
    }
}
