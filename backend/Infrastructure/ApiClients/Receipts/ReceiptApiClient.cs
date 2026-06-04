using BudgetFlowAPi.Infrastructure.ApiClients.Common;
using BudgetFlowAPi.Infrastructure.ApiClients.Receipts.Dtos;
using System.Net.Http.Headers;

namespace BudgetFlowAPi.Infrastructure.ApiClients.Receipts;

public class ReceiptApiClient : BaseApiClient<ReceiptDto>, IReceiptApiClient<ReceiptDto>
{
    public ReceiptApiClient(HttpClient httpClient) : base(httpClient)
    {
    }

    public async Task<ReceiptDto?> ExtractReceiptFieldsFromImageAsync(
        byte[] imageData, 
        CancellationToken cancellationToken = default)
    {
        using var content = new MultipartFormDataContent();
        var imageContent = new ByteArrayContent(imageData);
        imageContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");

        content.Add(imageContent, "file", "receipt.jpg");

        var response = await HttpClient.PostAsync("receipts/extract", content, cancellationToken);
        
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<ReceiptDto>(cancellationToken: cancellationToken);

        return result ?? new ReceiptDto();
    }
}