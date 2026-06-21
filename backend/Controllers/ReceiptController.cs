using Microsoft.AspNetCore.Mvc;
using BudgetFlowAPi.Services;
using BudgetFlowAPi.DTO;
using Microsoft.AspNetCore.Authorization;

namespace BudgetFlowAPi.Controllers;

[ApiController]
[Route("receipts")]
public class ReceiptController : ControllerBase
{
    private readonly IReceiptService _receiptService;

    public ReceiptController(IReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    [Authorize]
    [HttpPost]
    [HttpPost("/scan-receipt")]
    public async Task<IActionResult> ScanReceipt(CancellationToken cancellationToken)
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

        var receipt = await _receiptService.ExtractReceiptFieldsAsync(receiptImage, cancellationToken);
        if (receipt is null)
        {
            return Problem("Failed to extract fields from receipt image.");
        }

        return Ok(ReceiptScanDto.FromReceipt(receipt));
    }
}
