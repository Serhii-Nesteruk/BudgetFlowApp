using BudgetFlowAPi.Infrastructure.ApiClients.Common;
using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;

namespace BudgetFlowAPi.Infrastructure.ApiClients.Receipts;

public interface IReceiptApiClient<T> : IApiClient<T> where T : class
{
    Task<T?> ExtractReceiptFieldsFromImageAsync(byte[] imageData, CancellationToken cancellationToken = default);
}