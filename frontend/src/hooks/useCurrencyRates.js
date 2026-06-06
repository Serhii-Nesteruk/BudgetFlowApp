import { useState, useEffect } from "react";

const BASE = "PLN";
const CACHE_KEY = "fx_rates_cache";
const CACHE_TTL = 1000 * 60 * 60 * 4; // 4 hours

/**
 * Fetches EUR-based rates from ECB via open.er-api.com (free, no key needed),
 * then re-bases everything to PLN.
 * Returns { rates: { PLN:1, EUR:x, UAH:x, ... }, loading, error }
 */
export function useCurrencyRates() {
  const [rates, setRates]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Try cache first
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          if (!cancelled) { setRates(cached.rates); setLoading(false); }
          return;
        }
      } catch (_) {}

      try {
        // Free API, no key, CORS-friendly
        const res  = await fetch("https://open.er-api.com/v6/latest/PLN");
        const json = await res.json();
        if (!res.ok || json.result !== "success") throw new Error("API error");

        // json.rates is already PLN-based: { USD: 0.25, EUR: 0.23, UAH: 10.2, ... }
        const r = { ...json.rates, PLN: 1 };
        if (!cancelled) {
          setRates(r);
          setLoading(false);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), rates: r }));
        }
      } catch (e) {
        // Fallback: rough static rates (PLN base)
        const fallback = {
          PLN: 1, EUR: 0.23, USD: 0.25, UAH: 10.2,
          GBP: 0.2, CHF: 0.22, CZK: 5.7, SEK: 2.65,
          NOK: 2.7, DKK: 1.72, HUF: 92, RON: 1.15,
          BGN: 0.45, JPY: 37, CNY: 1.8, CAD: 0.34, AUD: 0.39,
        };
        if (!cancelled) { setRates(fallback); setLoading(false); setError("Курси офлайн — використовуються приблизні значення"); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { rates, loading, error };
}

/**
 * Convert amount in `currency` to PLN using rates object.
 * rates is PLN-based: 1 PLN = rates[currency] units of that currency
 * So: amountPLN = amount / rates[currency]
 */
export function toBase(amount, currency, rates) {
  if (!rates || !currency || currency === BASE) return Number(amount);
  const r = rates[currency];
  if (!r) return Number(amount); // unknown currency — pass through
  return Number(amount) / r;
}


export function convertAmount(amount, fromCurrency = "PLN", toCurrency = "PLN", rates) {
  const value = Number(amount || 0);
  if (!rates || !fromCurrency || !toCurrency || fromCurrency === toCurrency) return value;
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];
  if (!fromRate || !toRate) return value;
  const valueInPln = value / fromRate;
  return valueInPln * toRate;
}

export function currencySymbol(currency = "PLN") {
  return ({ PLN: "zł", UAH: "₴", USD: "$", EUR: "€", GBP: "£" })[currency] || currency;
}

export function formatCurrency(amount, currency = "PLN") {
  const value = Number(amount || 0);
  return `${value.toLocaleString("uk-UA", { maximumFractionDigits: 2 })} ${currencySymbol(currency)}`;
}
