// Data model v4: each entry has places: [{id, name, amount, details, notes}]

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function genPlaceId() {
  return "p_" + Math.random().toString(36).slice(2, 8);
}

const API = "/api/expenses";

export async function loadData() {
  const res = await fetch(API);
  if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
  return res.json();
}

export async function saveData(data) {
  const res = await fetch(API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save: ${res.status}`);
}

/** Compute total amount for an entry */
export function entryTotal(entry) {
  return entry.places.reduce((sum, p) => sum + (p.amount || 0), 0);
}

export function fmtDate(d) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y.slice(2)}`;
}

export function fmtAmount(n) {
  return `−${Math.abs(n).toFixed(2).replace(/\.00$/, "")} zł`;
}
