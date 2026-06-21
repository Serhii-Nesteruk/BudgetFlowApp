using BudgetFlowAPi.Infrastructure.ApiClients.Receipts;
using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

namespace BudgetFlowAPi.Services;

public class ReceiptService : IReceiptService
{
    private readonly IReceiptApiClient<ReceiptDto> _receiptApiClient;

    public ReceiptService(IReceiptApiClient<ReceiptDto> receiptApiClient)
    {
        _receiptApiClient = receiptApiClient;
    }

    public async Task<ReceiptDto?> ExtractReceiptFieldsAsync(IFormFile receiptImage, CancellationToken cancellationToken = default)
    {
        await using var stream = new MemoryStream();
        await receiptImage.CopyToAsync(stream, cancellationToken);
        return await _receiptApiClient.ExtractReceiptFieldsFromImageAsync(stream.ToArray(), cancellationToken);
    }
}
