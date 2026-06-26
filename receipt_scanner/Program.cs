using System.Globalization;
using Microsoft.AspNetCore.Http.Json;
using ReceiptScanner.Services;

CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
    options.SerializerOptions.DictionaryKeyPolicy = null;
    options.SerializerOptions.WriteIndented = true;
});

builder.Services.AddSingleton<OpenAiReceiptScanner>();

var app = builder.Build();

app.MapGet("/", () => Results.Ok(new
{
    Service = "ReceiptScanner",
    Mode = "OpenAI vision only",
    ScanEndpoint = "POST /api/receipts/scan",
    FormField = "file"
}));

app.MapPost("/api/receipts/scan", async (
    HttpRequest request,
    OpenAiReceiptScanner scanner,
    CancellationToken cancellationToken) =>
{
    if (!request.HasFormContentType)
    {
        return Results.BadRequest(new
        {
            Error = "Send receipt image as multipart/form-data with a file field named 'file'."
        });
    }

    var form = await request.ReadFormAsync(cancellationToken);
    var file = form.Files["file"] ?? form.Files.FirstOrDefault();

    if (file is null || file.Length == 0)
        return Results.BadRequest(new { Error = "Receipt image file is required." });

    await using var stream = file.OpenReadStream();
    var summary = await scanner.ScanAsync(
        stream,
        file.FileName,
        file.ContentType,
        cancellationToken);

    return Results.Ok(summary);
});

await app.RunAsync();
