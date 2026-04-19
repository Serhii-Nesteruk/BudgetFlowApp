using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Models;
using BudgetFlowAPi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

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
        var token = await _authService.AuthenticateAsync(loginRequest);
        if (token.IsNullOrEmpty())
        {
            return Unauthorized("Invalid email or password");
        }
        return Ok(new { Token = token });
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
