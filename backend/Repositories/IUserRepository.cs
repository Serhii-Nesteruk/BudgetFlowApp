using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
}