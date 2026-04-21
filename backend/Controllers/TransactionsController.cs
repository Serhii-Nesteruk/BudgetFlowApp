using System.Security.Claims;
using BudgetFlowAPi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BudgetFlowAPi.Extensions;

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

        return Ok(transactions);
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

        return Ok(transaction);
    }


}