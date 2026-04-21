using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetFlowAPi.Controllers;

[ApiController]
[Route("home")]    
public class HomeController : ControllerBase
{
    [Authorize]
    [HttpGet("profile")]
    public IActionResult Profile()
    {
        // TODO: implement me
        return Ok();
    }
}