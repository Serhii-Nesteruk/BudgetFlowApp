using Microsoft.AspNetCore.Mvc;
using BudgetFlowAPi.Services;
using BudgetFlowAPi.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace BudgetFlowAPi.Controllers;

[ApiController]
[Route("receipts")]
public class ReceiptController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    public ReceiptController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [Authorize]
    [HttpPost]
    [HttpPost("/scan-receipt")]
    public async Task<IActionResult> AddTransactionFromImage(CancellationToken cancellationToken)
    {
        var form = await Request.ReadFormAsync(cancellationToken);
        var receiptImage =
            form.Files["receiptImage"] ??
            form.Files["receipt"] ??
            form.Files.FirstOrDefault();

        if (receiptImage == null || receiptImage.Length == 0)
        {
            return BadRequest("No image file provided.");
        }

        var userId = User.GetUserId();
        var transaction = await _transactionService.AddTransactionFromReceiptImage(receiptImage, userId, cancellationToken);
        return Ok(transaction);
    }
}
