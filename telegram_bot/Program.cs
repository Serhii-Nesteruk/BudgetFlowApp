using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

var botToken = GetRequiredEnvironmentValue("TELEGRAM_BOT_TOKEN");
var backendBaseUrl = GetRequiredEnvironmentValue("BACKEND_BASE_URL").TrimEnd('/');
var webAppUrl = GetRequiredEnvironmentValue("TELEGRAM_WEB_APP_URL");
var telegramHttpTimeout = GetOptionalTimeout("TELEGRAM_HTTP_TIMEOUT_SECONDS", 120);
var backendHttpTimeout = GetOptionalTimeout("BACKEND_HTTP_TIMEOUT_SECONDS", 300);

using var telegramClient = new HttpClient
{
    BaseAddress = new Uri($"https://api.telegram.org/bot{botToken}/"),
    Timeout = telegramHttpTimeout
};
using var backendClient = new HttpClient
{
    BaseAddress = new Uri($"{backendBaseUrl}/"),
    Timeout = backendHttpTimeout
};

var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);
var offset = 0L;

Console.WriteLine("BudgetFlow Telegram bot started.");

while (true)
{
    try
    {
        var updates = await GetUpdatesAsync(offset);
        foreach (var update in updates)
        {
            offset = Math.Max(offset, update.UpdateId + 1);
            if (update.Message?.Text == null)
            {
                continue;
            }

            await HandleMessageAsync(update.Message);
        }
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"{DateTimeOffset.UtcNow:u} {ex}");
        await Task.Delay(TimeSpan.FromSeconds(5));
    }
}

async Task<IReadOnlyList<TelegramUpdate>> GetUpdatesAsync(long currentOffset)
{
    var response = await telegramClient.GetFromJsonAsync<TelegramResponse<List<TelegramUpdate>>>(
        $"getUpdates?timeout=30&offset={currentOffset}&allowed_updates=%5B%22message%22%5D",
        jsonOptions);

    return response?.Ok == true && response.Result != null ? response.Result : [];
}

async Task HandleMessageAsync(TelegramMessage message)
{
    var chatId = message.Chat.Id;
    var text = message.Text.Trim();
    var code = ExtractConnectionCode(text);

    if (code != null)
    {
        var connected = await ConnectTelegramAccountAsync(message, code);
        if (!connected)
        {
            await SendTextAsync(chatId, "Код недійсний або вже прострочений. Згенеруйте новий код у налаштуваннях BudgetFlow.");
            return;
        }

        await SendWebAppButtonAsync(chatId, "Telegram підключено. Відкрийте BudgetFlow нижче.");
        return;
    }

    await SendWebAppButtonAsync(
        chatId,
        "Відкрийте BudgetFlow у Telegram. Якщо акаунт ще не підключений, згенеруйте одноразовий код у налаштуваннях застосунку.");
}

async Task<bool> ConnectTelegramAccountAsync(TelegramMessage message, string code)
{
    var payload = new
    {
        Code = code,
        TelegramUserId = message.From?.Id ?? message.Chat.Id,
        Username = message.From?.Username ?? string.Empty,
        DisplayName = string.Join(' ', new[] { message.From?.FirstName, message.From?.LastName }
            .Where(value => !string.IsNullOrWhiteSpace(value)))
    };

    using var response = await backendClient.PostAsJsonAsync("users/settings/telegram/verify", payload, jsonOptions);
    return response.IsSuccessStatusCode;
}

async Task SendWebAppButtonAsync(long chatId, string text)
{
    var payload = new
    {
        chat_id = chatId,
        text,
        reply_markup = new
        {
            inline_keyboard = new[]
            {
                new[]
                {
                    new
                    {
                        text = "Відкрити BudgetFlow",
                        web_app = new { url = webAppUrl }
                    }
                }
            }
        }
    };

    await telegramClient.PostAsJsonAsync("sendMessage", payload, jsonOptions);
}

async Task SendTextAsync(long chatId, string text)
{
    await telegramClient.PostAsJsonAsync("sendMessage", new { chat_id = chatId, text }, jsonOptions);
}

static string? ExtractConnectionCode(string text)
{
    if (Regex.IsMatch(text, @"^\d{6}$"))
    {
        return text;
    }

    var match = Regex.Match(text, @"^/start(?:@\w+)?(?:\s+(\d{6}))?$", RegexOptions.IgnoreCase);
    return match.Success && match.Groups[1].Success ? match.Groups[1].Value : null;
}

static string GetRequiredEnvironmentValue(string name)
{
    var value = Environment.GetEnvironmentVariable(name);
    if (string.IsNullOrWhiteSpace(value))
    {
        throw new InvalidOperationException($"{name} environment variable is required.");
    }

    return value;
}

static TimeSpan GetOptionalTimeout(string name, int defaultSeconds)
{
    var raw = Environment.GetEnvironmentVariable(name);
    return int.TryParse(raw, out var seconds) && seconds > 0
        ? TimeSpan.FromSeconds(seconds)
        : TimeSpan.FromSeconds(defaultSeconds);
}

public sealed record TelegramResponse<T>(
    [property: JsonPropertyName("ok")] bool Ok,
    [property: JsonPropertyName("result")] T? Result);

public sealed record TelegramUpdate(
    [property: JsonPropertyName("update_id")] long UpdateId,
    [property: JsonPropertyName("message")] TelegramMessage? Message);

public sealed record TelegramMessage(
    [property: JsonPropertyName("chat")] TelegramChat Chat,
    [property: JsonPropertyName("from")] TelegramUser? From,
    [property: JsonPropertyName("text")] string Text);

public sealed record TelegramChat(
    [property: JsonPropertyName("id")] long Id);

public sealed record TelegramUser(
    [property: JsonPropertyName("id")] long Id,
    [property: JsonPropertyName("username")] string? Username,
    [property: JsonPropertyName("first_name")] string? FirstName,
    [property: JsonPropertyName("last_name")] string? LastName);
