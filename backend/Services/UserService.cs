using BudgetFlowAPi.Repositories;
using BudgetFlowAPi.Models; 
using BudgetFlowAPi.DTO;
using BCrypt.Net;

namespace BudgetFlowAPi.Services;
public sealed class UserService : CrudService<User>, IUserService
{
    private readonly IUserRepository _userRepository;
    public UserService(IUserRepository userRepository) : base(userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _userRepository.GetByEmailAsync(email);
    }
}