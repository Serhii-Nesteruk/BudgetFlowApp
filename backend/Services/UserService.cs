using BudgetFlowAPi.Repositories;
using BudgetFlowAPi.Models; 
using BudgetFlowAPi.DTO;
using BCrypt.Net;

namespace BudgetFlowAPi.Services;
public sealed class UserService : CrudService<User>, IUserService
{
    private readonly IRepository<User> _userRepository;
    public UserService(IRepository<User> userRepository) : base(userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        var users = await _userRepository.GetAllAsync();
        return users.FirstOrDefault(u => u.Email == email);
    }

    public async Task<User> RegisterAsync(RegisterRequestDto registerRequest)
    {
        var user = new User
        {
            Name = registerRequest.Name,
            Email = registerRequest.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password)
        };

        await _userRepository.AddAsync(user);
        return user;
    }
}