using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Data;
using BudgetFlowAPi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BudgetFlowAPi.Services;

public class AuthService : IAuthService
{
    private readonly IUserService _userService;
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(IUserService userService, AppDbContext context, IConfiguration configuration)
    {
        _userService = userService;
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto?> AuthenticateAsync(LoginRequestDto loginRequest)
    {
        var user = await _userService.GetByEmailAsync(loginRequest.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
        {
            return null;
        }

        return await CreateAuthResponseAsync(user);
    }

    public async Task<AuthResponseDto?> AuthenticateTelegramWebAppAsync(string initData)
    {
        var telegramUserId = ValidateTelegramWebAppInitData(initData);
        if (telegramUserId == null)
        {
            return null;
        }

        var account = await _context.TelegramAccounts
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.TelegramUserId == telegramUserId.Value);

        return account?.User == null ? null : await CreateAuthResponseAsync(account.User);
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

    public async Task<AuthResponseDto?> RefreshAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == refreshToken);

        if (storedToken?.User == null || !storedToken.IsActive)
        {
            return null;
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        var response = await CreateAuthResponseAsync(storedToken.User);
        await _context.SaveChangesAsync();

        return response;
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == refreshToken);
        if (storedToken == null || storedToken.RevokedAt != null)
        {
            return;
        }

        storedToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
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
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<AuthResponseDto> CreateAuthResponseAsync(User user)
    {
        var refreshToken = new RefreshToken
        {
            Token = GenerateRefreshToken(),
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        };

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = GenerateJwtToken(user),
            RefreshToken = refreshToken.Token
        };
    }

    private static string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    private long? ValidateTelegramWebAppInitData(string initData)
    {
        var botToken = _configuration.GetValue<string>("Telegram:BotToken");
        if (string.IsNullOrWhiteSpace(botToken) || string.IsNullOrWhiteSpace(initData))
        {
            return null;
        }

        var values = ParseQueryString(initData);
        if (!values.TryGetValue("hash", out var receivedHash) || string.IsNullOrWhiteSpace(receivedHash))
        {
            return null;
        }

        if (!values.TryGetValue("auth_date", out var authDateValue) ||
            !long.TryParse(authDateValue, out var authDateUnix))
        {
            return null;
        }

        var maxAgeMinutes = _configuration.GetValue<int?>("Telegram:WebAppAuthMaxAgeMinutes") ?? 1440;
        var authDate = DateTimeOffset.FromUnixTimeSeconds(authDateUnix);
        if (authDate < DateTimeOffset.UtcNow.AddMinutes(-maxAgeMinutes) ||
            authDate > DateTimeOffset.UtcNow.AddMinutes(5))
        {
            return null;
        }

        var dataCheckString = string.Join("\n", values
            .Where(x => x.Key != "hash")
            .OrderBy(x => x.Key, StringComparer.Ordinal)
            .Select(x => $"{x.Key}={x.Value}"));

        var secretKey = HMACSHA256.HashData(
            Encoding.UTF8.GetBytes("WebAppData"),
            Encoding.UTF8.GetBytes(botToken));
        var computedHash = Convert.ToHexString(HMACSHA256.HashData(
            secretKey,
            Encoding.UTF8.GetBytes(dataCheckString))).ToLowerInvariant();

        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.ASCII.GetBytes(computedHash),
                Encoding.ASCII.GetBytes(receivedHash.ToLowerInvariant())))
        {
            return null;
        }

        if (!values.TryGetValue("user", out var userJson) || string.IsNullOrWhiteSpace(userJson))
        {
            return null;
        }

        try
        {
            using var document = System.Text.Json.JsonDocument.Parse(userJson);
            return document.RootElement.TryGetProperty("id", out var idElement)
                ? idElement.GetInt64()
                : null;
        }
        catch (System.Text.Json.JsonException)
        {
            return null;
        }
    }

    private static Dictionary<string, string> ParseQueryString(string queryString)
    {
        return queryString
            .TrimStart('?')
            .Split('&', StringSplitOptions.RemoveEmptyEntries)
            .Select(part =>
            {
                var index = part.IndexOf('=');
                var key = index >= 0 ? part[..index] : part;
                var value = index >= 0 ? part[(index + 1)..] : string.Empty;
                return new KeyValuePair<string, string>(
                    WebUtility.UrlDecode(key),
                    WebUtility.UrlDecode(value));
            })
            .Where(x => !string.IsNullOrWhiteSpace(x.Key))
            .ToDictionary(x => x.Key, x => x.Value);
    }
}
