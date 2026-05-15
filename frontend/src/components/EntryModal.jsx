import { useState, useEffect, useCallback } from "react";
import { genPlaceId } from "../data/store";
import styles from "./EntryModal.module.css";

const today = () => new Date().toISOString().slice(0, 10);
function emptyPlace() { return { id: genPlaceId(), name: "", amount: "", details: "", notes: "" }; }

export default function EntryModal({ open, entry, onSave, onClose }) {
  const [date, setDate]             = useState(today());
  const [places, setPlaces]         = useState([emptyPlace()]);
  const [newPlaceName, setNewPlace] = useState("");

  useEffect(() => {
    if (open) {
      if (entry) {
        setDate(entry.date);
        setPlaces(entry.places.map((p) => ({ ...p, amount: String(p.amount ?? "") })));
      } else {
        setDate(today());
        setPlaces([emptyPlace()]);
      }
      setNewPlace("");
    }
  }, [open, entry]);

  const addPlace = useCallback(() => {
    const name = newPlaceName.trim();
    if (!name) return;
    setPlaces((prev) => [...prev, { ...emptyPlace(), name }]);
    setNewPlace("");
  }, [newPlaceName]);

  const removePlace  = (id) => setPlaces((prev) => prev.filter((p) => p.id !== id));
  const updatePlace  = (id, field, value) => setPlaces((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));

  const handleSave = () => {
    if (!date) { alert("Вкажіть дату"); return; }
    const valid = places.filter((p) => p.name.trim());
    if (!valid.length) { alert("Додайте хоча б одне місце"); return; }
    onSave({ date, places: valid.map((p) => ({ ...p, name: p.name.trim(), amount: parseFloat(p.amount) || 0 })) });
  };

  const total = places.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>{entry ? "Редагувати запис" : "Новий запис"}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.group}>
            <label className={styles.label}>Дата</label>
            <input type="date" className={styles.input} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Додати місце</label>
            <div className={styles.addRow}>
              <input
                type="text"
                className={styles.input}
                placeholder="Назва місця (Kaufland, Żabka…)"
                value={newPlaceName}
                onChange={(e) => setNewPlace(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPlace(); } }}
              />
              <button className={styles.addBtn} onClick={addPlace}>+ Додати</button>
            </div>
          </div>

          {places.length > 0 && (
            <div className={styles.placeList}>
              {places.map((place) => (
                <div key={place.id} className={styles.placeCard}>
                  <div className={styles.placeHeader}>
                    <input type="text" className={[styles.input, styles.placeName].join(" ")} placeholder="Місце" value={place.name} onChange={(e) => updatePlace(place.id, "name", e.target.value)} />
                    <input type="number" className={[styles.input, styles.placeAmount].join(" ")} placeholder="0.00 zł" value={place.amount} onChange={(e) => updatePlace(place.id, "amount", e.target.value)} />
                    {places.length > 1 && <button className={styles.removeBtn} onClick={() => removePlace(place.id)}>×</button>}
                  </div>
                  <input type="text" className={styles.input} placeholder="Деталі / продукти" value={place.details} onChange={(e) => updatePlace(place.id, "details", e.target.value)} />
                  <input type="text" className={styles.input} placeholder="Нотатки" value={place.notes} onChange={(e) => updatePlace(place.id, "notes", e.target.value)} />
                </div>
              ))}
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Загалом:</span>
                <span className={styles.totalValue}>{total.toFixed(2).replace(/\.00$/, "")} zł</span>
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
