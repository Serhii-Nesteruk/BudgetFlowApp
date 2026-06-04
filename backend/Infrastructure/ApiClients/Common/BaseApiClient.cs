using BudgetFlowAPi.Infrastructure.ApiClients.Common;

namespace BudgetFlowAPi.Infrastructure.ApiClients.Common;

public class BaseApiClient<T> : IApiClient<T> where T : class
{
    protected readonly HttpClient HttpClient;

    public BaseApiClient(HttpClient httpClient)
    {
        HttpClient = httpClient;
    }

    public async Task<T?> GetAsync(string endpoint, CancellationToken cancellationToken = default)
    {
        var response = await HttpClient.GetAsync(endpoint, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(cancellationToken: cancellationToken);
    }

    public async Task<T?> PostAsync(string endpoint, T data, CancellationToken cancellationToken = default)
    {
        var response = await HttpClient.PostAsJsonAsync(endpoint, data, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(cancellationToken: cancellationToken);
    }

    public async Task<T?> PutAsync(string endpoint, T data, CancellationToken cancellationToken = default)
    {
        var response = await HttpClient.PutAsJsonAsync(endpoint, data, cancellationToken);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(cancellationToken: cancellationToken);
    }

    public async Task DeleteAsync(string endpoint, CancellationToken cancellationToken = default)
    {
        var response = await HttpClient.DeleteAsync(endpoint, cancellationToken);
        response.EnsureSuccessStatusCode();
    }
}