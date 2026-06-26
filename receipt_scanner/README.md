# ReceiptScanner

Small API service that extracts receipt data by sending the uploaded image directly to OpenAI vision.

## Run

```bash
export OPENAI_API_KEY="your-api-key"
dotnet run --project ReceiptScanner.csproj
```

Optional model override:

```bash
export OPENAI_RECEIPT_MODEL="gpt-4.1-mini"
```

Scan endpoint:

```bash
curl -F "file=@receipt.jpg" http://localhost:8080/api/receipts/scan
```

The response shape matches the backend receipt client:

```json
{
  "Counterparty": "Stokrotka",
  "TotalAmount": 102.81,
  "Currency": "PLN",
  "Date": "2026-02-11",
  "Time": "13:54",
  "Items": [
    {
      "Name": "Mleko",
      "Quantity": 2,
      "UnitPrice": 3.49,
      "TotalPrice": 6.98
    }
  ],
  "openai_service_used": true
}
```
