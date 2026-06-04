import { useRef, useState } from "react";
import { Btn } from "./UI";
import styles from "./ScanReceiptModal.module.css";

const IconCamera = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconX = () => (   
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

export default function ScanReceiptModal({ onClose, onSuccess }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  function handleFile(f) {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setMessage("");
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleSubmit() {
    if (!file) return;
    setStatus("loading");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Помилка сервера");

      setStatus("success");
      setMessage(data.message || "Чек успішно розпізнано!");
      setTimeout(() => {
        onSuccess?.(data);
        onClose();
      }, 1500);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setMessage("");
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <IconCamera />
            <div>
              <div className={styles.title}>Сканувати чек</div>
              <div className={styles.subtitle}>Завантажте фото чека — запис додається автоматично</div>
            </div>
          </div>
          <button className={styles.close} onClick={onClose}><IconX /></button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {!preview ? (
            <div
              className={[styles.dropzone, dragging ? styles.dragging : ""].join(" ")}
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className={styles.dropIcon}><IconUpload /></div>
              <div className={styles.dropText}>Перетягніть фото або <span>виберіть файл</span></div>
              <div className={styles.dropHint}>JPG, PNG, WEBP — до 10 МБ</div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className={styles.hiddenInput}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className={styles.preview}>
              <img src={preview} alt="Чек" className={styles.previewImg} />
              <button className={styles.previewReset} onClick={handleReset}>
                <IconX /> Замінити
              </button>
            </div>
          )}

          {/* Status message */}
          {message && (
            <div className={[styles.message, styles[status]].join(" ")}>
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Btn variant="ghost" onClick={onClose}>Скасувати</Btn>
          <Btn
            variant="primary"
            onClick={handleSubmit}
            disabled={!file || status === "loading" || status === "success"}
          >
            {status === "loading" ? "Обробка..." : "Розпізнати чек"}
          </Btn>
        </div>

      </div>
    </div>
  );
}