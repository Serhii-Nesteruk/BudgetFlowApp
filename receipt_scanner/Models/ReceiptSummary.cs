using System.Text.Json.Serialization;

namespace ReceiptScanner.Models;

public sealed class ReceiptSummary
{
    public string? Counterparty { get; set; }

    public decimal? TotalAmount { get; set; }

    public string? Currency { get; set; }

    public string? Date { get; set; }

    public string? Time { get; set; }

    public List<ReceiptItem> Items { get; set; } = [];

    [JsonPropertyName("openai_service_used")]
    public bool OpenAiServiceUsed { get; set; } = true;
}
