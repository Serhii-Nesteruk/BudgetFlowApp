using BudgetFlowAPi.Models;

namespace BudgetFlowAPi.Mappings;

public static class ReceiptMapping
{
    public async static Task<Receipt> FromFormFileToModel(this IFormFile receiptImage)
    {
        using var memoryStream = new MemoryStream();
        await receiptImage.CopyToAsync(memoryStream);
        return new Receipt
        {
            Photo = memoryStream.ToArray(),
            FileName = receiptImage.FileName,
            ContentType = receiptImage.ContentType
        };
    }
}