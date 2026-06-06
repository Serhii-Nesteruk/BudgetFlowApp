using BudgetFlowAPi.DTO; using BudgetFlowAPi.Models; using BudgetFlowAPi.Extensions; using BudgetFlowAPi.Mappings; using BudgetFlowAPi.Services; using Microsoft.AspNetCore.Authorization; using Microsoft.AspNetCore.Mvc;
namespace BudgetFlowAPi.Controllers;
[ApiController][Authorize][Route("budgets")]
public class BudgetsController : ControllerBase
{
 private readonly IBudgetService _service; public BudgetsController(IBudgetService service){_service=service;}
 [HttpGet] public async Task<IActionResult> GetAll()=>Ok((await _service.GetVisibleForUserIdAsync(User.GetUserId())).Select(x=>x.ToDto()));
 [HttpGet("{id:int}")] public async Task<IActionResult> GetById(int id){var x=await _service.GetByIdForVisibleUserIdAsync(id,User.GetUserId());return x==null?NotFound():Ok(x.ToDto());}
 [HttpGet("shared/{token:guid}")] public async Task<IActionResult> GetBySharedLink(Guid token){var x=await _service.GetByShareTokenForVisibleUserIdAsync(token,User.GetUserId());return x==null?Forbid():Ok(x.ToDto());}
 [HttpPost] public async Task<IActionResult> Create([FromBody] BudgetDto dto){try{var x=await _service.AddAsync(dto,User.GetUserId());return CreatedAtAction(nameof(GetById),new{id=x.Id},x.ToDto());}catch(ArgumentException e){return BadRequest(e.Message);}}
 [HttpPut("{id:int}")] public async Task<IActionResult> Update(int id,[FromBody] BudgetDto dto){try{var x=await _service.UpdateAsync(id,dto,User.GetUserId());return x==null?NotFound():Ok(x.ToDto());}catch(ArgumentException e){return BadRequest(e.Message);}}
 [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id)=>await _service.DeleteForOwnerAsync(id,User.GetUserId())?NoContent():NotFound();
 [HttpPost("{id:int}/categories")] public async Task<IActionResult> AddCategory(int id,[FromBody] BudgetCategoryDto dto)=>Result(await _service.AddCategoryAsync(id,dto,User.GetUserId()));
 [HttpPut("{id:int}/categories/{categoryId:int}")] public async Task<IActionResult> UpdateCategory(int id,int categoryId,[FromBody] BudgetCategoryDto dto)=>Result(await _service.UpdateCategoryAsync(id,categoryId,dto,User.GetUserId()));
 [HttpDelete("{id:int}/categories/{categoryId:int}")] public async Task<IActionResult> DeleteCategory(int id,int categoryId)=>Result(await _service.DeleteCategoryAsync(id,categoryId,User.GetUserId()));
 [HttpPost("{id:int}/income-sources")] public async Task<IActionResult> AddIncome(int id,[FromBody] BudgetIncomeSourceDto dto)=>Result(await _service.AddIncomeSourceAsync(id,dto,User.GetUserId()));
 [HttpPut("{id:int}/income-sources/{itemId:int}")] public async Task<IActionResult> UpdateIncome(int id,int itemId,[FromBody] BudgetIncomeSourceDto dto)=>Result(await _service.UpdateIncomeSourceAsync(id,itemId,dto,User.GetUserId()));
 [HttpDelete("{id:int}/income-sources/{itemId:int}")] public async Task<IActionResult> DeleteIncome(int id,int itemId)=>Result(await _service.DeleteIncomeSourceAsync(id,itemId,User.GetUserId()));
 [HttpPost("{id:int}/mandatory-expenses")] public async Task<IActionResult> AddMandatory(int id,[FromBody] BudgetMandatoryExpenseDto dto)=>Result(await _service.AddMandatoryExpenseAsync(id,dto,User.GetUserId()));
 [HttpPut("{id:int}/mandatory-expenses/{itemId:int}")] public async Task<IActionResult> UpdateMandatory(int id,int itemId,[FromBody] BudgetMandatoryExpenseDto dto)=>Result(await _service.UpdateMandatoryExpenseAsync(id,itemId,dto,User.GetUserId()));
 [HttpDelete("{id:int}/mandatory-expenses/{itemId:int}")] public async Task<IActionResult> DeleteMandatory(int id,int itemId)=>Result(await _service.DeleteMandatoryExpenseAsync(id,itemId,User.GetUserId()));
 [HttpPost("{id:int}/planned-expenses")] public async Task<IActionResult> AddPlanned(int id,[FromBody] BudgetPlannedExpenseDto dto)=>Result(await _service.AddPlannedExpenseAsync(id,dto,User.GetUserId()));
 [HttpPut("{id:int}/planned-expenses/{itemId:int}")] public async Task<IActionResult> UpdatePlanned(int id,int itemId,[FromBody] BudgetPlannedExpenseDto dto)=>Result(await _service.UpdatePlannedExpenseAsync(id,itemId,dto,User.GetUserId()));
 [HttpDelete("{id:int}/planned-expenses/{itemId:int}")] public async Task<IActionResult> DeletePlanned(int id,int itemId)=>Result(await _service.DeletePlannedExpenseAsync(id,itemId,User.GetUserId()));
 [HttpPost("{id:int}/shared-users")] public async Task<IActionResult> Share(int id,[FromBody] ShareBudgetUserDto dto){try{return Result(await _service.ShareWithUserAsync(id,dto.Email,User.GetUserId()));}catch(ArgumentException e){return BadRequest(e.Message);}}
 [HttpDelete("{id:int}/shared-users/{userId:int}")] public async Task<IActionResult> RemoveShared(int id,int userId)=>Result(await _service.RemoveSharedUserAsync(id,userId,User.GetUserId()));
 [HttpPost("{id:int}/sharing")] public async Task<IActionResult> SetSharing(int id,[FromQuery] bool enabled,[FromQuery] bool regenerateToken=false)=>Result(await _service.SetSharingAsync(id,enabled,User.GetUserId(),regenerateToken));
 [HttpPost("{id:int}/plan-next-months")] public async Task<IActionResult> PlanNextMonths(int id,[FromBody] BudgetPlanNextMonthsDto dto){try{var items=await _service.PlanNextMonthsAsync(id,dto.Months,User.GetUserId());return Ok(items.Select(x=>x.ToDto()));}catch(ArgumentException e){return BadRequest(e.Message);}}
 private IActionResult Result(Budget? x)=>x==null?NotFound():Ok(x.ToDto());
}
