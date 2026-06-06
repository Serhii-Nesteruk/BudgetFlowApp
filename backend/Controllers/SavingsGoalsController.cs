using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Extensions;
using BudgetFlowAPi.Mappings;
using BudgetFlowAPi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetFlowAPi.Controllers;

[ApiController]
[Authorize]
[Route("savings-goals")]
public class SavingsGoalsController : ControllerBase
{
    private readonly ISavingsGoalService _service;

    public SavingsGoalsController(ISavingsGoalService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok((await _service.GetByUserIdAsync(User.GetUserId())).Select(x => x.ToDto()));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var goal = await _service.GetByIdForUserIdAsync(id, User.GetUserId());
        return goal == null ? NotFound() : Ok(goal.ToDto());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SavingsGoalDto dto)
    {
        try
        {
            var goal = await _service.AddAsync(dto, User.GetUserId());
            return CreatedAtAction(nameof(GetById), new
            {
                id = goal.Id
            }, goal.ToDto());
        }
        catch (ArgumentException error)
        {
            return BadRequest(error.Message);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SavingsGoalDto dto)
    {
        try
        {
            var goal = await _service.UpdateAsync(id, dto, User.GetUserId());
            return goal == null ? NotFound() : Ok(goal.ToDto());
        }
        catch (ArgumentException error)
        {
            return BadRequest(error.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _service.DeleteForUserAsync(id, User.GetUserId()) ? NoContent() : NotFound();

    [HttpPost("{id:int}/entries")]
    public async Task<IActionResult> AddEntry(int id, [FromBody] SavingsEntryDto dto)
    {
        try
        {
            var goal = await _service.AddEntryAsync(id, dto, User.GetUserId());
            return goal == null ? NotFound() : Ok(goal.ToDto());
        }
        catch (ArgumentException error)
        {
            return BadRequest(error.Message);
        }
    }

    [HttpDelete("{id:int}/entries/{entryId:int}")]
    public async Task<IActionResult> DeleteEntry(int id, int entryId)
    {
        var goal = await _service.DeleteEntryAsync(id, entryId, User.GetUserId());
        return goal == null ? NotFound() : Ok(goal.ToDto());
    }
}
