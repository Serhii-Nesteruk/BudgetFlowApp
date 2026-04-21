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
    private ITransactionService _transactionService;
    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [Authorize]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllTransactions()
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);
        
        var transactions = await _transactionService.GetByUserIdAsync(userId);
        if (transactions == null)
        {
            return NotFound();
        }


        return Ok(TransactionMapping.ToDtoList(transactions));
    }

    [Authorize]
    [HttpGet("{id}")]
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
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        var transaction = await _transactionService.GetByIdForUserIdAsync(id, userId);
        if (transaction == null)
        {
            return NotFound();
        }

        await _transactionService.DeleteAsync(transaction.Id);

        return Ok();
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionDto dto)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);

        var transaction = await _transactionService.GetByIdForUserIdAsync(id, userId);
        if (transaction == null)
        {
            return NotFound();
        }

        transaction.Counterparty = dto.Counterparty;
        transaction.Title = dto.Title;
        transaction.Description = dto.Description;
        transaction.Amount = dto.Amount;
        transaction.Currency = dto.Currency;
        transaction.Date = dto.Date;
        transaction.Type = dto.Type;

        await _transactionService.UpdateAsync(transaction);

        return Ok(TransactionMapping.ToDto(transaction));
        
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateTransaction([FromBody] TransactionDto dto)
    {
        var userId = ClaimsPrincipalExtensions.GetUserId(User);
        var createdTransaction = await _transactionService.AddAsync(dto, userId);
        return Ok(TransactionMapping.ToDto(createdTransaction));
    }
}