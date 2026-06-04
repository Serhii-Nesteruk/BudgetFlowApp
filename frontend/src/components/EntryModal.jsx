import { useState, useEffect, useCallback, useRef } from "react";
import { genPlaceId } from "../data/store";
import styles from "./EntryModal.module.css";

const today = () => new Date().toISOString().slice(0, 10);
function emptyPlace() { return { id: genPlaceId(), name: "", amount: "", details: "", notes: "" }; }

const CURRENCIES = [
  { code: "PLN", symbol: "zł",  name: "Польський злотий" },
  { code: "EUR", symbol: "€",   name: "Євро" },
  { code: "USD", symbol: "$",   name: "Долар США" },
  { code: "UAH", symbol: "₴",   name: "Гривня" },
  { code: "GBP", symbol: "£",   name: "Британський фунт" },
  { code: "CHF", symbol: "Fr",  name: "Швейцарський франк" },
  { code: "CZK", symbol: "Kč",  name: "Чеська крона" },
  { code: "SEK", symbol: "kr",  name: "Шведська крона" },
  { code: "NOK", symbol: "kr",  name: "Норвезька крона" },
  { code: "DKK", symbol: "kr",  name: "Данська крона" },
  { code: "HUF", symbol: "Ft",  name: "Угорський форинт" },
  { code: "RON", symbol: "lei", name: "Румунський лей" },
  { code: "BGN", symbol: "лв",  name: "Болгарський лев" },
  { code: "HRK", symbol: "kn",  name: "Хорватська куна" },
  { code: "JPY", symbol: "¥",   name: "Японська єна" },
  { code: "CNY", symbol: "¥",   name: "Китайський юань" },
  { code: "CAD", symbol: "C$",  name: "Канадський долар" },
  { code: "AUD", symbol: "A$",  name: "Австралійський долар" },
];

function PlaceCombobox({ value, onChange, allPlaces }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const wrapRef = useRef(null);

  useEffect(() => { setInputVal(value); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allPlaces.filter(
    (p) => p.toLowerCase().includes(inputVal.toLowerCase()) && p !== inputVal
  );

  const handleInput = (e) => {
    setInputVal(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (place) => {
    setInputVal(place);
    onChange(place);
    setOpen(false);
  };

  return (
    <div className={styles.comboWrap} ref={wrapRef}>
      <div className={styles.comboInputRow}>
        <input
          type="text"
          className={[styles.input, styles.placeName].join(" ")}
          placeholder="Місце"
          value={inputVal}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {allPlaces.length > 0 && (
          <button
            type="button"
            className={styles.comboChevron}
            onClick={() => setOpen((o) => !o)}
            tabIndex={-1}
            aria-label="Показати список місць"
          >▾</button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul className={styles.comboDropdown}>
          {filtered.map((place) => (
            <li
              key={place}
              className={styles.comboOption}
              onMouseDown={() => handleSelect(place)}
            >
              {place}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function EntryModal({ open, entry, onSave, onClose, allPlaces = [] }) {
  const [date, setDate]         = useState(today());
  const [places, setPlaces]     = useState([emptyPlace()]);
  const [currency, setCurrency] = useState("PLN");

  useEffect(() => {
    if (open) {
      if (entry) {
        setDate(entry.date);
        setPlaces(entry.places.map((p) => ({ ...p, amount: String(p.amount ?? "") })));
        // currency lives on each place (transaction), take it from the first one
        const entryCurrency = entry.currency
          || entry.places?.[0]?.currency
          || "PLN";
        setCurrency(entryCurrency);
      } else {
        setDate(today());
        setPlaces([emptyPlace()]);
        setCurrency("PLN");
      }
    }
  }, [open, entry]);

  const addPlace = useCallback(() => {
    setPlaces((prev) => [...prev, emptyPlace()]);
  }, []);

  const removePlace  = (id) => setPlaces((prev) => prev.filter((p) => p.id !== id));
  const updatePlace  = (id, field, value) => setPlaces((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));

  const handleSave = () => {
    if (!date) { alert("Вкажіть дату"); return; }
    const valid = places.filter((p) => p.name.trim());
    if (!valid.length) { alert("Додайте хоча б одне місце"); return; }
    onSave({
      date,
      currency,
      places: valid.map((p) => ({ ...p, name: p.name.trim(), amount: parseFloat(p.amount) || 0 })),
    });
  };

  const total = places.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const currencyObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>{entry ? "Редагувати запис" : "Новий запис"}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Date + Currency row */}
          <div className={styles.dateRow}>
            <div className={styles.group} style={{ flex: 1 }}>
              <label className={styles.label}>Дата</label>
              <input type="date" className={styles.input} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className={styles.group} style={{ width: 160 }}>
              <label className={styles.label}>Валюта</label>
              <select
                className={styles.input}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.symbol} ({c.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Places */}
          <div className={styles.group}>
            <div className={styles.placesHeader}>
              <label className={styles.label}>Місця</label>
              <button className={styles.addBtn} onClick={addPlace}>+ Додати місце</button>
            </div>
          </div>

          {places.length > 0 && (
            <div className={styles.placeList}>
              {places.map((place) => (
                <div key={place.id} className={styles.placeCard}>
                  <div className={styles.placeHeader}>
                    <PlaceCombobox
                      value={place.name}
                      onChange={(val) => updatePlace(place.id, "name", val)}
                      allPlaces={allPlaces}
                    />
                    <div className={styles.amountWrap}>
                      <input
                        type="number"
                        className={[styles.input, styles.placeAmount].join(" ")}
                        placeholder={`0.00 ${currencyObj.symbol}`}
                        value={place.amount}
                        onChange={(e) => updatePlace(place.id, "amount", e.target.value)}
                      />
                    </div>
                    {places.length > 1 && (
                      <button className={styles.removeBtn} onClick={() => removePlace(place.id)}>×</button>
                    )}
                  </div>
                  <input type="text" className={styles.input} placeholder="Деталі / продукти" value={place.details} onChange={(e) => updatePlace(place.id, "details", e.target.value)} />
                  <input type="text" className={styles.input} placeholder="Нотатки" value={place.notes} onChange={(e) => updatePlace(place.id, "notes", e.target.value)} />
                </div>
              ))}
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Загалом:</span>
                <span className={styles.totalValue}>
                  {total.toFixed(2).replace(/\.00$/, "")} {currencyObj.symbol}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.footerBtn} onClick={onClose}>Скасувати</button>
          <button className={styles.footerBtnPrimary} onClick={handleSave}>Зберегти</button>
        </div>
      </div>
    </div>
  );
}
