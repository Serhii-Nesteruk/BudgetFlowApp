export function entryTotal(entry) {
  return entry.places.reduce((sum, place) => sum + Number(place.amount || 0), 0);
}

export function placeToTransactionPayload(place, date) {
  return {
    id: Number(place.id) || 0,
    counterparty: place.name ?? "",
    title: "",
    details: place.details ?? "",
    description: place.notes ?? "",
    amount: Number(place.amount),
    currency: "PLN",
    date: `${date}T00:00:00Z`,
    type: 0,
  };
}

export function entryToTransactionPayloads(entry) {
  return entry.places.map((place) =>
    placeToTransactionPayload(place, entry.date)
  );
}