using BudgetFlowAPi.DTO; using BudgetFlowAPi.Extensions; using BudgetFlowAPi.Services; using Microsoft.AspNetCore.Authorization; using Microsoft.AspNetCore.Mvc;
namespace BudgetFlowAPi.Controllers;
[ApiController][Route("users/settings")]
public class UserSettingsController : ControllerBase
{
 private readonly IUserService _userService; private readonly IConfiguration _configuration;
 public UserSettingsController(IUserService userService,IConfiguration configuration){_userService=userService;_configuration=configuration;}
 [Authorize][HttpGet] public async Task<IActionResult> GetSettings()=>Ok(await _userService.GetSettingsAsync(User.GetUserId()));
 [Authorize][HttpPut] public async Task<IActionResult> UpdateSettings([FromBody] UserSettingsDto dto)=>Ok(await _userService.UpdateSettingsAsync(User.GetUserId(),dto));
 [Authorize][HttpPost("telegram/connection-code")] public async Task<IActionResult> GenerateTelegramCode(){var link=_configuration.GetValue<string>("Telegram:BotLink")??"https://t.me/finance_tracker_demo_bot";return Ok(await _userService.GenerateTelegramConnectionCodeAsync(User.GetUserId(),link));}
 [AllowAnonymous][HttpPost("telegram/verify")] public async Task<IActionResult> VerifyTelegramCode([FromBody] TelegramVerifyCodeDto dto){try{var account=await _userService.VerifyTelegramConnectionCodeAsync(dto);return account==null?BadRequest("Invalid or expired code."):Ok(account);}catch(ArgumentException e){return BadRequest(e.Message);}}
 [Authorize][HttpDelete("telegram/accounts/{id:int}")] public async Task<IActionResult> DeleteTelegramAccount(int id)=>await _userService.DeleteTelegramAccountAsync(User.GetUserId(),id)?NoContent():NotFound();
}
