using BudgetFlowAPi.Mappings;
using BudgetFlowAPi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetFlowAPi.Extensions;
using BudgetFlowAPi.DTO;

namespace BudgetFlowAPi.Controllers;

[ApiController]
[Route("transactions")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAllTransactions()
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        var transactions = await _transactionService.GetByUserIdAsync(userId);

        return Ok(TransactionMapping.ToDtoList(transactions));
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTransactionDetails(int id)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        var transaction = await _transactionService.GetByIdForUserIdAsync(id, userId);
        if (transaction == null)
        {
            return NotFound();
        }

        return Ok(TransactionMapping.ToDto(transaction));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        var transaction = await _transactionService.GetByIdForUserIdAsync(id, userId);
        if (transaction == null)
        {
            return NotFound();
        }

        await _transactionService.DeleteAsync(transaction.Id);

        return NoContent();
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionDto dto)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        var transaction = await _transactionService.GetByIdForUserIdAsync(id, userId);
        if (transaction == null)
        {
            return NotFound();
        }

        dto.Id = id;
        dto.UserId = userId;
        await _transactionService.UpdateAsync(dto);

        var updated = await _transactionService.GetByIdForUserIdAsync(id, userId);
        return Ok(TransactionMapping.ToDto(updated!));

    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] TransactionDto dto)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);
        var createdTransaction = await _transactionService.AddAsync(dto, userId);
        return CreatedAtAction
        (
            nameof(GetTransactionDetails),
            new
            {
                id = createdTransaction.Id
            },
            TransactionMapping.ToDto(createdTransaction)
        );
    }

    [Authorize]
    [HttpGet("grouped")]
    public async Task<IActionResult> GetGroupedTransactions()
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        var transactions = await _transactionService.GetByUserIdAsync(userId);

        return Ok(TransactionMapping.ToGroupedDtoList(transactions));
    }
}
