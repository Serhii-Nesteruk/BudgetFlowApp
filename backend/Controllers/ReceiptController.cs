using Microsoft.AspNetCore.Mvc;
using BudgetFlowAPi.Services;

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

    [HttpPost]
    public async Task<IActionResult> AddTransactionFromImage([FromForm] IFormFile receiptImage, CancellationToken cancellationToken)
    {
        if (receiptImage == null || receiptImage.Length == 0)
        {
            return BadRequest("No image file provided.");
        }

        var transaction = await _transactionService.AddTransactionFromReceiptImage(receiptImage, 1, cancellationToken);
        return Ok(transaction);
    }
}
