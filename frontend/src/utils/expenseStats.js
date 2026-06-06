import { entryCurrency } from "../data/store";
import { toBase } from "../hooks/useCurrencyRates";

/**
 * Returns an expense place currency, falling back to its grouped entry currency.
 */
export function placeCurrency(place, entry) {
  return place?.currency || entryCurrency(entry);
}

/**
 * Sum a grouped expense entry in PLN.
 * Rates are PLN-based: 1 PLN = rates[currency] units of a target currency.
 */
export function entryTotalPLN(entry, rates) {
  return (entry?.places || []).reduce(
    (sum, place) => sum + toBase(place.amount || 0, placeCurrency(place, entry), rates),
    0
  );
}

/**
 * Calculate the summary cards shown above the expense table.
 */
export function buildExpenseSummaryPLN(data, rates) {
  const totals = (data || []).map((entry) => entryTotalPLN(entry, rates));
  const total = totals.reduce((sum, value) => sum + value, 0);

  return {
    total,
    avg: totals.length ? total / totals.length : 0,
    max: totals.length ? Math.max(...totals) : 0,
  };
}
