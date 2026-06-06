using BudgetFlowAPi.DTO;
using BudgetFlowAPi.Extensions;
using BudgetFlowAPi.Mappings;
using BudgetFlowAPi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BudgetFlowAPi.Controllers;

[ApiController]
[Route("debts")]
public class DebtsController : ControllerBase
{
    private readonly IDebtService _debtService;

    public DebtsController(IDebtService debtService)
    {
        _debtService = debtService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAllDebts()
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);
        var debts = await _debtService.GetByUserIdAsync(userId);
        return Ok(DebtMapping.ToDtoList(debts));
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetDebtDetails(int id)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);
        var debt = await _debtService.GetByIdForUserIdAsync(id, userId);

        if (debt == null)
        {
            return NotFound();
        }

        return Ok(DebtMapping.ToDto(debt));
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateDebt([FromBody] DebtDto dto)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        try
        {
            var createdDebt = await _debtService.AddAsync(dto, userId);
            return CreatedAtAction(
                nameof(GetDebtDetails),
                new { id = createdDebt.Id },
                DebtMapping.ToDto(createdDebt));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateDebt(int id, [FromBody] DebtDto dto)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        try
        {
            var debt = await _debtService.UpdateAsync(id, dto, userId);
            return debt == null ? NotFound() : Ok(DebtMapping.ToDto(debt));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteDebt(int id)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);
        var debt = await _debtService.GetByIdForUserIdAsync(id, userId);

        if (debt == null)
        {
            return NotFound();
        }

        await _debtService.DeleteAsync(id);
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:int}/payments")]
    public async Task<IActionResult> AddPayment(int id, [FromBody] DebtPaymentRequestDto dto)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        try
        {
            var debt = await _debtService.AddPaymentAsync(id, dto, userId);
            return debt == null ? NotFound() : Ok(DebtMapping.ToDto(debt));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [Authorize]
    [HttpPost("{id:int}/mark-paid")]
    public async Task<IActionResult> MarkPaid(int id)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);
        var debt = await _debtService.MarkPaidAsync(id, userId);
        return debt == null ? NotFound() : Ok(DebtMapping.ToDto(debt));
    }

    [Authorize]
    [HttpPost("{id:int}/recurring-charge")]
    public async Task<IActionResult> AddRecurringCharge(int id, [FromBody] RecurringDebtChargeDto dto)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        try
        {
            var debt = await _debtService.AddRecurringChargeAsync(id, dto, userId);
            return debt == null ? NotFound() : Ok(DebtMapping.ToDto(debt));
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }
}
