import { useState, useEffect, useCallback } from "react";
import { genPlaceId } from "../data/store";
import { Btn } from "./UI";
import styles from "./EntryModal.module.css";

const today = () => new Date().toISOString().slice(0, 10);

function emptyPlace() {
  return { id: genPlaceId(), name: "", amount: "", details: "", notes: "" };
}

export default function EntryModal({ open, entry, onSave, onClose }) {
  const [date, setDate] = useState(today());
  const [places, setPlaces] = useState([emptyPlace()]);
  const [newPlaceName, setNewPlaceName] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (open) {
      if (entry) {
        setDate(entry.date);
        setPlaces(entry.places.map((p) => ({ ...p, amount: String(p.amount ?? "") })));
      } else {
        setDate(today());
        setPlaces([emptyPlace()]);
      }
      setNewPlaceName("");
    }
  }, [open, entry]);

  const addPlace = useCallback(() => {
    const name = newPlaceName.trim();
    if (!name) return;
    setPlaces((prev) => [...prev, { ...emptyPlace(), name }]);
    setNewPlaceName("");
  }, [newPlaceName]);

  const removePlace = (id) => setPlaces((prev) => prev.filter((p) => p.id !== id));

  const updatePlace = (id, field, value) => {
    setPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = () => {
    if (!date) { alert("Вкажіть дату"); return; }
    const validPlaces = places.filter((p) => p.name.trim());
    if (!validPlaces.length) { alert("Додайте хоча б одне місце"); return; }
    const normalized = validPlaces.map((p) => ({
      ...p,
      name: p.name.trim(),
      amount: parseFloat(p.amount) || 0,
    }));
    onSave({ date, places: normalized });
  };

  const total = places.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>{entry ? "Редагувати запис" : "Новий запис"}</span>
          <Btn variant="ghost" size="sm" onClick={onClose}>✕</Btn>
        </div>

        <div className={styles.body}>
          {/* Date */}
          <div className={styles.group}>
            <label className={styles.label}>Дата</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Add place row */}
          <div className={styles.group}>
            <label className={styles.label}>Додати місце</label>
            <div className={styles.addRow}>
              <input
                type="text"
                className={styles.input}
                placeholder="Назва місця (Kaufland, Żabka…)"
                value={newPlaceName}
                onChange={(e) => setNewPlaceName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPlace(); } }}
              />
              <Btn variant="primary" size="sm" onClick={addPlace}>+ Додати</Btn>
            </div>
          </div>

          {/* Per-place rows */}
          {places.length > 0 && (
            <div className={styles.placeList}>
              {places.map((place, idx) => (
                <div key={place.id} className={styles.placeCard}>
                  <div className={styles.placeHeader}>
                    <input
                      type="text"
                      className={[styles.input, styles.placeName].join(" ")}
                      placeholder="Місце"
                      value={place.name}
                      onChange={(e) => updatePlace(place.id, "name", e.target.value)}
                    />
                    <input
                      type="number"
                      className={[styles.input, styles.placeAmount].join(" ")}
                      placeholder="0.00 zł"
                      value={place.amount}
                      onChange={(e) => updatePlace(place.id, "amount", e.target.value)}
                    />
                    {places.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removePlace(place.id)}
                        title="Видалити місце"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Деталі / продукти (яблука, сир, батон…)"
                    value={place.details}
                    onChange={(e) => updatePlace(place.id, "details", e.target.value)}
                  />
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Нотатки"
                    value={place.notes}
                    onChange={(e) => updatePlace(place.id, "notes", e.target.value)}
                  />
                </div>
              ))}

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Загалом:</span>
                <span className={styles.totalValue}>
                  {total.toFixed(2).replace(/\.00$/, "")} zł
                </span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Btn onClick={onClose}>Скасувати</Btn>
          <Btn variant="primary" onClick={handleSave}>Зберегти</Btn>
        </div>
      </div>
    </div>
  );
}
