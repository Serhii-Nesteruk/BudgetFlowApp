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
    public AuthController(IUserService userService) {
        _userService = userService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginRequest)
    {
        var user = await _userService.GetByEmailAsync(loginRequest.Email);
        if (user == null)
        {
            return NotFound("User not found");
        }
        
        // TODO: continue implementation
        return Ok(user);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerRequest)
    {
        var existingUser = await _userService.GetByEmailAsync(registerRequest.Email);
        if (existingUser != null)
        {
            return BadRequest("Email already in use");
        }

        var createdUser = await _userService.RegisterAsync(registerRequest);

        return Ok(new
        {
            Id = createdUser.Id,
            Name = createdUser.Name,
            Email = createdUser.Email
        });
    }
}
