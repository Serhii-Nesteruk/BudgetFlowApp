using BudgetFlowAPi.Infrastructure.ApiClients.Receipts;
using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;
using BudgetFlowAPi.Models;
using BudgetFlowAPi.Repositories;
using BudgetFlowAPi.Mappings;

namespace BudgetFlowAPi.Services;

public class ReceiptService : CrudService<Receipt>, IReceiptService
{
    private readonly IReceiptRepository _receiptRepository;
    private readonly IReceiptApiClient<ReceiptDto> _receiptApiClient;
    public ReceiptService(
        IReceiptRepository receiptRepository,
     IReceiptApiClient<ReceiptDto> receiptApiClient) : base(receiptRepository)
    {
        _receiptRepository = receiptRepository;
        _receiptApiClient = receiptApiClient;
    }
    public async Task<ReceiptDto?> ExtractReceiptFieldsAsync(IFormFile receiptImage, CancellationToken cancellationToken = default)
    {
        var receipt = await ReceiptMapping.FromFormFileToModel(receiptImage);
        await _receiptRepository.AddAsync(receipt);
        return await _receiptApiClient.ExtractReceiptFieldsFromImageAsync(receipt.Photo, cancellationToken);
    }
}