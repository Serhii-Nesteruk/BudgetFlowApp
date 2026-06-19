import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  deleteTelegramAccount,
  generateTelegramConnectionCode,
  getUserSettings,
  updateUserSettings,
} from "../api/userSettingsApi";
import { applyLanguage, getInitialLanguage } from "../i18n/language";
import { applyFontSize, FONT_SIZE_OPTIONS, getStoredFontSize } from "../utils/fontSize";
import { applyTheme, getStoredTheme, THEME_OPTIONS } from "../utils/theme";
import styles from "./SettingsPage.module.css";

const DEFAULT_NOTIFICATIONS = {
  budgetLimit: true,
  newEntry: false,
  debtDeadline: true,
};

const IconTelegram = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const IconCopy = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m20 6-11 11-5-5" />
  </svg>
);

const IconTrash = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
);

function dateLabel(value) {
  return value ? new Date(value).toLocaleDateString("uk-UA") : "";
}

export default function SettingsPage() {
  const [currency, setCurrency] = useState("PLN");
  const [language, setLanguage] = useState(() => getInitialLanguage());
  const [fontSize, setFontSize] = useState(() => getStoredFontSize() || "normal");
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [accounts, setAccounts] = useState([]);
  const [connectData, setConnectData] = useState(null);
  const [copied, setCopied] = useState("");
  const [minGap, setMinGap] = useState("30");
  const [debtReminderBefore, setDebtReminderBefore] = useState("3");
  const [debtRepeat, setDebtRepeat] = useState("24");
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const hydrated = useRef(false);

  const hasTelegram = accounts.length > 0;
  const telegramLink = useMemo(
    () => connectData?.botLink || "https://t.me/finance_tracker_demo_bot",
    [connectData]
  );

  function applySettings(data) {
    setCurrency(data.baseCurrency || "PLN");
    setLanguage(data.language || "uk");
    setFontSize(applyFontSize(getStoredFontSize() || data.fontSize || "normal"));
    setMinGap(String(data.minimumNotificationGapMinutes ?? 30));
    setDebtReminderBefore(String(data.debtReminderBeforeDays ?? 3));
    setDebtRepeat(String(data.debtReminderRepeatHours ?? 24));
    setNotifications((current) => {
      const next = {
        budgetLimit: data.budgetLimitNotificationsEnabled ?? true,
        newEntry: data.newEntryNotificationsEnabled ?? false,
        debtDeadline: data.debtDeadlineNotificationsEnabled ?? true,
      };
      return current.budgetLimit === next.budgetLimit &&
        current.newEntry === next.newEntry &&
        current.debtDeadline === next.debtDeadline
        ? current
        : next;
    });
    setAccounts(data.telegramAccounts || []);
  }

  async function loadSettings({ quiet = false } = {}) {
    try {
      if (!quiet) setLoading(true);
      setError("");
      const data = await getUserSettings();
      applySettings(data);
      hydrated.current = true;
    } catch (e) {
      setError(e.message);
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    applyLanguage(language);
  }, [language]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!connectData) return undefined;
    const timer = window.setInterval(() => loadSettings({ quiet: true }), 4000);
    return () => window.clearInterval(timer);
  }, [connectData]);

  useEffect(() => {
    if (!hydrated.current) return undefined;
    const timer = window.setTimeout(async () => {
      try {
        setSaving(true);
        setError("");
        const data = await updateUserSettings({
          baseCurrency: currency,
          language,
          fontSize,
          minimumNotificationGapMinutes: Number(minGap || 30),
          budgetLimitNotificationsEnabled: notifications.budgetLimit,
          newEntryNotificationsEnabled: notifications.newEntry,
          debtDeadlineNotificationsEnabled: notifications.debtDeadline,
          debtReminderBeforeDays: Number(debtReminderBefore || 3),
          debtReminderRepeatHours: Number(debtRepeat || 24),
        });
        setAccounts(data.telegramAccounts || []);
        const syncedData = { ...data, fontSize };
        applyFontSize(fontSize);
        window.dispatchEvent(new CustomEvent("user-settings-updated", { detail: syncedData }));
      } catch (e) {
        setError(e.message);
      } finally {
        setSaving(false);
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [currency, language, fontSize, minGap, debtReminderBefore, debtRepeat, notifications]);

  async function openConnection() {
    try {
      setError("");
      setConnectData(await generateTelegramConnectionCode());
      setCopied("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function copyText(value, field) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  async function removeAccount(id) {
    try {
      setError("");
      await deleteTelegramAccount(id);
      setAccounts((items) => items.filter((item) => item.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  function toggleNotification(key) {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.heading}>
          <div>
            <h1>Налаштування</h1>
            <p>Завантаження…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1>Налаштування</h1>
          <p>Конфігурація застосунку та підключених сервісів.</p>
        </div>
        <span className={styles.mockBadge}>{saving ? "Збереження…" : "Збережено в акаунті"}</span>
      </div>

      {error && (
        <div style={{ marginBottom: 14, color: "#b42318", fontWeight: 700 }}>⚠ {error}</div>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}>
            <IconTelegram />
          </div>
          <div>
            <h2>Telegram-бот</h2>
            <p>Підключіть Telegram-акаунт для отримання сповіщень.</p>
          </div>
          <button className={styles.primaryBtn} onClick={openConnection}>
            Підключити
          </button>
        </div>

        <div className={styles.sectionBody}>
          <div className={styles.subTitle}>Підключені акаунти</div>
          {accounts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <IconTelegram size={20} />
              </div>
              <div>
                <strong>Ще немає підключених акаунтів</strong>
                <p>Після надсилання одноразового коду боту акаунт з’явиться у цьому списку.</p>
              </div>
            </div>
          ) : (
            <div className={styles.accountList}>
              {accounts.map((account) => (
                <div className={styles.accountRow} key={account.id}>
                  <div className={styles.accountAvatar}>
                    {(account.displayName || account.username || "T").slice(0, 1)}
                  </div>
                  <div className={styles.accountInfo}>
                    <strong>{account.displayName || "Telegram"}</strong>
                    <span>{account.username || `ID: ${account.telegramUserId}`}</span>
                  </div>
                  <span className={styles.connectedBadge}>
                    <IconCheck /> Підключено
                  </span>
                  <span className={styles.accountDate}>{dateLabel(account.connectedAt)}</span>
                  <button
                    className={styles.iconBtn}
                    aria-label="Видалити акаунт"
                    onClick={() => removeAccount(account.id)}
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeaderSimple}>
          <div>
            <h2>Основні налаштування</h2>
            <p>Параметри відображення застосунку.</p>
          </div>
        </div>
        <div className={styles.formGrid}>
          <Field label="Основна валюта" hint="Використовується для відображення сум у застосунку.">
            <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
              <option value="UAH">Українська гривня (₴)</option>
              <option value="USD">Долар США ($)</option>
              <option value="EUR">Євро (€)</option>
              <option value="PLN">Польський злотий (zł)</option>
            </select>
          </Field>
          <Field label="Мова застосунку" hint="Зберігається в налаштуваннях профілю.">
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="uk">Українська</option>
              <option value="en">English</option>
              <option value="pl">Polski</option>
            </select>
          </Field>
          <Field
            label="Розмір шрифту"
            hint="Змінюється лише в безпечному діапазоні, щоб картки та кнопки не ламалися."
          >
            <select value={fontSize} onChange={(event) => setFontSize(event.target.value)}>
              {FONT_SIZE_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label} — {option.hint}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Тема" hint="Вибір теми застосунку.">
            <div className={styles.themeSelector} role="group" aria-label="Тема застосунку">
              {THEME_OPTIONS.map((option) => (
                <button
                  className={[
                    styles.themeOption,
                    theme === option.value ? styles.themeOptionActive : "",
                  ].join(" ")}
                  type="button"
                  aria-pressed={theme === option.value}
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.hint}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>
      </section>

      <section className={[styles.section, !hasTelegram ? styles.sectionDisabled : ""].join(" ")}>
        <div className={styles.sectionHeaderSimple}>
          <div>
            <h2>Сповіщення</h2>
            <p>Налаштування повідомлень, які надсилатиме Telegram-бот.</p>
          </div>
          {!hasTelegram && <span className={styles.warningBadge}>Підключіть Telegram-бота</span>}
        </div>

        <fieldset className={styles.notifications} disabled={!hasTelegram}>
          <div className={styles.notificationGap}>
            <div>
              <strong>Мінімальний інтервал між сповіщеннями</strong>
              <p>Не надсилати повідомлення частіше, ніж вказано нижче.</p>
            </div>
            <div className={styles.compactControl}>
              <input
                type="number"
                min="1"
                value={minGap}
                onChange={(event) => setMinGap(event.target.value)}
              />
              <span>хв</span>
            </div>
          </div>

          <NotificationRow
            title="Наближення до ліміту бюджету"
            description="Попереджати, коли витрати категорії наближаються до верхньої межі."
            checked={notifications.budgetLimit}
            onChange={() => toggleNotification("budgetLimit")}
          />
          <NotificationRow
            title="Додавання нового запису"
            description="Надсилати коротке підтвердження після додавання витрати або доходу."
            checked={notifications.newEntry}
            onChange={() => toggleNotification("newEntry")}
          />
          <NotificationRow
            title="Дедлайн оплати боргу"
            description="Нагадувати про борг до дедлайну та повторювати нагадування, доки його не закрито."
            checked={notifications.debtDeadline}
            onChange={() => toggleNotification("debtDeadline")}
          >
            <div className={styles.inlineOptions}>
              <label>
                <span>Нагадати за</span>
                <select
                  value={debtReminderBefore}
                  onChange={(event) => setDebtReminderBefore(event.target.value)}
                >
                  <option value="1">1 день</option>
                  <option value="3">3 дні</option>
                  <option value="7">7 днів</option>
                </select>
              </label>
              <label>
                <span>Повторювати кожні</span>
                <select value={debtRepeat} onChange={(event) => setDebtRepeat(event.target.value)}>
                  <option value="6">6 годин</option>
                  <option value="12">12 годин</option>
                  <option value="24">24 години</option>
                  <option value="48">48 годин</option>
                </select>
              </label>
            </div>
          </NotificationRow>
        </fieldset>
      </section>

      {connectData &&
        createPortal(
          <div
            className={styles.modalBackdrop}
            role="presentation"
            onMouseDown={() => setConnectData(null)}
          >
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-label="Підключити Telegram-бота"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className={styles.modalIcon}>
                <IconTelegram size={23} />
              </div>
              <h2>Підключення Telegram-бота</h2>
              <p className={styles.modalText}>
                Перейдіть за посиланням і надішліть боту одноразовий код. Код діє до{" "}
                {new Date(connectData.expiresAt).toLocaleTimeString("uk-UA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>

              <div className={styles.connectBlock}>
                <span>Одноразовий код</span>
                <div className={styles.copyRow}>
                  <strong className={styles.code}>{connectData.code}</strong>
                  <button
                    className={styles.copyBtn}
                    onClick={() => copyText(connectData.code, "code")}
                  >
                    {copied === "code" ? <IconCheck /> : <IconCopy />}
                    {copied === "code" ? "Скопійовано" : "Копіювати"}
                  </button>
                </div>
              </div>

              <div className={styles.connectBlock}>
                <span>Посилання на бота</span>
                <div className={styles.copyRow}>
                  <a href={telegramLink} target="_blank" rel="noreferrer">
                    {telegramLink}
                  </a>
                  <button className={styles.copyBtn} onClick={() => copyText(telegramLink, "link")}>
                    {copied === "link" ? <IconCheck /> : <IconCopy />}
                    {copied === "link" ? "Скопійовано" : "Копіювати"}
                  </button>
                </div>
              </div>

              <div className={styles.modalHint}>
                Після надсилання коду ботом список акаунтів оновиться автоматично протягом кількох
                секунд.
              </div>
              <div className={styles.modalActions}>
                <button className={styles.secondaryBtn} onClick={() => setConnectData(null)}>
                  Закрити
                </button>
                <button className={styles.primaryBtn} onClick={() => loadSettings({ quiet: true })}>
                  Оновити список
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className={styles.field}>
      <strong>{label}</strong>
      <span>{hint}</span>
      {children}
    </label>
  );
}

function NotificationRow({ title, description, checked, onChange, children }) {
  return (
    <div className={styles.notificationRow}>
      <div className={styles.notificationMain}>
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <label className={styles.switch}>
          <input type="checkbox" checked={checked} onChange={onChange} />
          <span />
        </label>
      </div>
      {children && checked && children}
    </div>
  );
}
