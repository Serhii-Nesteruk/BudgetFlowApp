export function entryTotal(entry) {
  return entry.places.reduce((sum, place) => sum + Number(place.amount || 0), 0);
}

export function placeToTransactionPayload(place, date, currency = "PLN") {
  return {
    id: Number(place.id) || 0,
    counterparty: place.name ?? "",
    title: "",
    details: place.details ?? "",
    description: place.notes ?? "",
    amount: Number(place.amount),
    currency: currency,
    date: `${date}T00:00:00Z`,
    type: 0,
    tags: place.tags ?? [],
  };
}

export function entryToTransactionPayloads(entry) {
  return entry.places.map((place) =>
    placeToTransactionPayload(place, entry.date, entry.currency || "PLN")
  );
}

function scanDateToInputValue(value) {
  if (!value) return new Date().toISOString().slice(0, 10);

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? new Date().toISOString().slice(0, 10)
    : date.toISOString().slice(0, 10);
}

function itemDetails(item) {
  const name = String(item.name ?? item.Name ?? "").trim();
  if (!name) return null;

  const quantity = item.quantity ?? item.Quantity;
  const totalPrice = item.totalPrice ?? item.TotalPrice ?? item.price ?? item.Price;
  const unitPrice = item.unitPrice ?? item.UnitPrice;
  const quantityText = quantity == null ? "" : ` × ${quantity}`;
  const price = totalPrice ?? unitPrice;

  return price == null ? `${name}${quantityText}` : `${name}${quantityText} — ${price}`;
}

export function receiptScanToEntry(scan) {
  const items = Array.isArray(scan.items)
    ? scan.items
    : Array.isArray(scan.Items)
      ? scan.Items
      : [];
  const details = items.map(itemDetails).filter(Boolean).join("\n");

  return {
    date: scanDateToInputValue(scan.date ?? scan.Date ?? scan.transactionDate),
    currency: String(scan.currency ?? scan.Currency ?? "PLN").toUpperCase(),
    places: [
      {
        id: genReceiptDraftId(),
        name: String(scan.counterparty ?? scan.Counterparty ?? "").trim(),
        amount: Number(scan.totalAmount ?? scan.TotalAmount) || 0,
        details,
        notes: "",
        tags: [],
      },
    ],
  };
}

function genReceiptDraftId() {
  return `receipt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
