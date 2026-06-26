using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;
using BudgetFlowAPi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BudgetFlowAPi.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IAuthService _authService;
    public AuthController(IUserService userService, IAuthService authService)
    {
        _userService = userService;
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        var tokens = await _authService.AuthenticateAsync(loginRequest);
        if (tokens == null)
        {
            return Unauthorized("Invalid email or password");
        }

        return Ok(tokens);
    }

    [HttpPost("telegram-webapp")]
    public async Task<IActionResult> TelegramWebAppLogin([FromBody] TelegramWebAppAuthRequestDto request)
    {
        var tokens = await _authService.AuthenticateTelegramWebAppAsync(request.InitData);
        if (tokens == null)
        {
            return Unauthorized("Telegram account is not connected or init data is invalid");
        }

        return Ok(tokens);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto refreshRequest)
    {
        if (string.IsNullOrWhiteSpace(refreshRequest.RefreshToken))
        {
            return BadRequest("Refresh token is required");
        }

        var tokens = await _authService.RefreshAsync(refreshRequest.RefreshToken);
        if (tokens == null)
        {
            return Unauthorized("Invalid refresh token");
        }

        return Ok(tokens);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto logoutRequest)
    {
        if (!string.IsNullOrWhiteSpace(logoutRequest.RefreshToken))
        {
            await _authService.LogoutAsync(logoutRequest.RefreshToken);
        }

        return NoContent();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequest)
    {
        var existingUser = await _userService.GetByEmailAsync(registerRequest.Email);
        if (existingUser != null)
        {
            return BadRequest("Email already in use");
        }

        var createdUser = await _authService.RegisterAsync(registerRequest);

        return Ok(new
        {
            Id = createdUser.Id,
            Name = createdUser.Name,
            Email = createdUser.Email
        });
    }
}
