using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BudgetFlowAPi.Services;

public class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;

    public AuthService(IUserService userService, IConfiguration configuration)
    {
        _userService = userService;
        _configuration = configuration;
    }

    public async Task<string> AuthenticateAsync(LoginRequestDto loginRequest)
    {
        var user = await _userService.GetByEmailAsync(loginRequest.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
        {
            return string.Empty;
        }
        return GenerateJwtToken(user);
    }

    public async Task<User> RegisterAsync(RegisterRequestDto registerRequest)
    {
        var user = new User
        {
            Name = registerRequest.Name,
            Email = registerRequest.Email, // TODO: validate email
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerRequest.Password),
            Settings = new UserSettings
            {
                Language = NormalizeLanguage(registerRequest.Language),
                CreatedAt = DateTime.UtcNow
            }
        };

        await _userService.AddAsync(user);
        return user;
    }

    private static string NormalizeLanguage(string? language)
    {
        var normalized = (language ?? string.Empty).Trim().ToLowerInvariant().Split('-', '_')[0];
        return normalized is "uk" or "en" or "pl" ? normalized : "en";
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var keyString = _configuration.GetValue<string>("Jwt:Key") ?? throw new Exception("JWT key not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration.GetValue<string>("Jwt:Issuer"),
            audience: _configuration.GetValue<string>("Jwt:Audience"),
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
