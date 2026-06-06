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
