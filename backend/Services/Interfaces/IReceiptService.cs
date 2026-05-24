using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

namespace BudgetFlowAPi.Services;

public interface IReceiptService
{
    Task<ReceiptDto?>  ExtractReceiptFieldsAsync(IFormFile receiptImage, CancellationToken cancellationToken = default);
}