using System.Text.Json;
using OpenAI;
using OpenAI.Chat;
using ReceiptScanner.Models;
using System.ClientModel;

namespace ReceiptScanner.Services;

public sealed class OpenAiReceiptScanner
{
    private const string DefaultModel = "gpt-4.1-mini";

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly string _apiKey;
    private readonly string _model;
    private readonly ChatClient _client;

    public OpenAiReceiptScanner()
    {
        _apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY")
            ?? throw new InvalidOperationException("OPENAI_API_KEY is not set.");

        var model = Environment.GetEnvironmentVariable("OPENAI_RECEIPT_MODEL");
        _model = string.IsNullOrWhiteSpace(model) ? DefaultModel : model;

        var timeout = GetOptionalTimeout("OPENAI_RECEIPT_TIMEOUT_SECONDS", 300);
        _client = new ChatClient(
            _model,
            new ApiKeyCredential(_apiKey),
            new OpenAIClientOptions
            {
                NetworkTimeout = timeout
            });
    }

    public async Task<ReceiptSummary> ScanAsync(
        Stream imageStream,
        string fileName,
        string? contentType,
        CancellationToken cancellationToken)
    {
        using var memory = new MemoryStream();
        await imageStream.CopyToAsync(memory, cancellationToken);

        if (memory.Length == 0)
            throw new InvalidOperationException("Receipt image is empty.");

        var imageBytes = BinaryData.FromBytes(memory.ToArray());
        List<ChatMessage> messages =
        [
            new SystemChatMessage(
                "You extract structured receipt data from receipt images. " +
                "Use the image as the only source of truth. Do not invent values. " +
                "Normalize every item name into a short, human-readable generic product or service name. " +
                "Remove brands, store-specific prefixes, OCR garbage, SKU-like fragments, packaging codes, and redundant variants. " +
                "Choose item-name language by receipt country: Polish receipts use Polish, Ukrainian receipts use Ukrainian, all other countries use English. " +
                "If the country is ambiguous, infer it from currency and receipt language: PLN means Polish, UAH means Ukrainian, otherwise use English. " +
                "Keep merchant names unchanged."
            ),
            new UserChatMessage(
            [
                ChatMessageContentPart.CreateTextPart(
                    "Extract the receipt summary. Required output shape: " +
                    "{\"Counterparty\":\"Stokrotka\",\"TotalAmount\":102.81,\"Currency\":\"PLN\",\"Date\":\"2026-02-11\",\"Time\":\"13:54\",\"Items\":[{\"Name\":\"Mleko\",\"Quantity\":2,\"UnitPrice\":3.49,\"TotalPrice\":6.98}]}\n\n" +
                    "Rules:\n" +
                    "- Counterparty: merchant/store name, or \"Unknown\" if not visible.\n" +
                    "- TotalAmount: final amount to pay as a JSON number, or null if not visible.\n" +
                    "- Currency: ISO currency code, usually \"PLN\", or null if not visible.\n" +
                    "- Date: ISO date yyyy-MM-dd, or null if not visible.\n" +
                    "- Time: HH:mm 24-hour time, or null if not visible.\n" +
                    "- Items: every purchased product or service visible on the receipt. Do not include totals, tax, payment, discounts, or change lines.\n" +
                    "- Normalize each item Name to a concise human-readable generic product name; remove brands and OCR noise.\n" +
                    "- For every item, Name is required. Use null for Quantity, UnitPrice, or TotalPrice when that value is not visible.\n" +
                    "- Do not include explanations or extra properties."
                ),
                ChatMessageContentPart.CreateImagePart(
                    imageBytes,
                    GetImageMediaType(fileName, contentType),
                    ChatImageDetailLevel.High
                )
            ])
        ];

        ChatCompletionOptions options = new()
        {
            ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                jsonSchemaFormatName: "receipt_summary",
                jsonSchema: BinaryData.FromBytes("""
                    {
                      "type": "object",
                      "properties": {
                        "Counterparty": {
                          "type": "string"
                        },
                        "TotalAmount": {
                          "type": ["number", "null"]
                        },
                        "Currency": {
                          "type": ["string", "null"]
                        },
                        "Date": {
                          "type": ["string", "null"]
                        },
                        "Time": {
                          "type": ["string", "null"]
                        },
                        "Items": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "Name": { "type": "string" },
                              "Quantity": { "type": ["number", "null"] },
                              "UnitPrice": { "type": ["number", "null"] },
                              "TotalPrice": { "type": ["number", "null"] }
                            },
                            "required": ["Name", "Quantity", "UnitPrice", "TotalPrice"],
                            "additionalProperties": false
                          }
                        }
                      },
                      "required": ["Counterparty", "TotalAmount", "Currency", "Date", "Time", "Items"],
                      "additionalProperties": false
                    }
                    """u8.ToArray()),
                jsonSchemaIsStrict: true)
        };

        var completion = await _client.CompleteChatAsync(messages, options, cancellationToken);
        var content = completion.Value.Content.Count > 0
            ? completion.Value.Content[0].Text
            : null;

        if (string.IsNullOrWhiteSpace(content))
            throw new InvalidOperationException("OpenAI returned an empty receipt response.");

        var summary = JsonSerializer.Deserialize<ReceiptSummary>(content, JsonOptions)
            ?? throw new InvalidOperationException("OpenAI returned an invalid receipt response.");

        summary.Counterparty = string.IsNullOrWhiteSpace(summary.Counterparty)
            ? "Unknown"
            : summary.Counterparty.Trim();

        summary.Items = summary.Items
            .Where(item => !string.IsNullOrWhiteSpace(item.Name))
            .Select(item =>
            {
                item.Name = item.Name.Trim();
                return item;
            })
            .ToList();

        summary.OpenAiServiceUsed = true;

        return summary;
    }

    private static string GetImageMediaType(string fileName, string? contentType)
    {
        if (contentType is "image/png" or "image/webp" or "image/jpeg")
            return contentType;

        var extension = Path.GetExtension(fileName);

        if (extension.Equals(".png", StringComparison.OrdinalIgnoreCase))
            return "image/png";

        if (extension.Equals(".webp", StringComparison.OrdinalIgnoreCase))
            return "image/webp";

        return "image/jpeg";
    }

    private static TimeSpan GetOptionalTimeout(string name, int defaultSeconds)
    {
        var raw = Environment.GetEnvironmentVariable(name);
        return int.TryParse(raw, out var seconds) && seconds > 0
            ? TimeSpan.FromSeconds(seconds)
            : TimeSpan.FromSeconds(defaultSeconds);
    }
}
