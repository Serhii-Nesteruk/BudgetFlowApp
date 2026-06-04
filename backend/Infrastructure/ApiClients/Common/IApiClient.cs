using System.Net.Http.Json;

namespace BudgetFlowAPi.Infrastructure.ApiClients.Common;

public interface IApiClient<T> where T : class
{
    Task<T?> GetAsync(string endpoint, CancellationToken cancellationToken = default);
    Task<T?> PostAsync(string endpoint, T data,  CancellationToken cancellationToken = default);
    Task<T?> PutAsync(string endpoint, T data, CancellationToken cancellationToken = default);
    Task DeleteAsync(string endpoint, CancellationToken cancellationToken = default);
}