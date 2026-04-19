using BudgetFlowAPi.Repositories;

namespace BudgetFlowAPi.Services;

public abstract class CrudService<T> : ICrudService<T> where T : class
{
    protected readonly IRepository<T> _repository;
    public CrudService(IRepository<T> repository)
    {
        _repository = repository;
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public virtual async Task<T?> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id); 
    }

    public virtual async Task AddAsync(T entity)
    {
        await _repository.AddAsync(entity);
    }

    public virtual async Task UpdateAsync(T entity)
    {
        await _repository.UpdateAsync(entity);
    }

    public virtual async Task DeleteAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}