import { useMemo, useState } from "react";
import styles from "./SettingsPage.module.css";

const DEFAULT_NOTIFICATIONS = {
  budgetLimit: true,
  newEntry: false,
  debtDeadline: true,
};

const IconTelegram = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m20 6-11 11-5-5" />
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
  </svg>
);

function makeCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function SettingsPage() {
  const [currency, setCurrency] = useState("UAH");
  const [language, setLanguage] = useState("uk");
  const [accounts, setAccounts] = useState([]);
  const [connectData, setConnectData] = useState(null);
  const [copied, setCopied] = useState("");
  const [minGap, setMinGap] = useState("30");
  const [debtReminderBefore, setDebtReminderBefore] = useState("3");
  const [debtRepeat, setDebtRepeat] = useState("24");
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const hasTelegram = accounts.length > 0;
  const telegramLink = useMemo(() => "https://t.me/finance_tracker_demo_bot", []);

  function openConnection() {
    setConnectData({ code: makeCode(), link: telegramLink });
    setCopied("");
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

  function simulateConnection() {
    setAccounts(current => {
      if (current.some(account => account.username === "@serhii_finance")) return current;
      return [
        ...current,
        {
          id: Date.now(),
          username: "@serhii_finance",
          displayName: "Serhii",
          connectedAt: new Date().toLocaleDateString("uk-UA"),
        },
      ];
    });
    setConnectData(null);
  }

  function toggleNotification(key) {
    setNotifications(current => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1>Налаштування</h1>
          <p>Конфігурація застосунку та підключених сервісів.</p>
        </div>
        <span className={styles.mockBadge}>Візуальна демо-версія</span>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionIcon}><IconTelegram /></div>
          <div>
            <h2>Telegram-бот</h2>
            <p>Підключіть Telegram-акаунт для отримання сповіщень.</p>
          </div>
          <button className={styles.primaryBtn} onClick={openConnection}>Підключити</button>
        </div>

        <div className={styles.sectionBody}>
          <div className={styles.subTitle}>Підключені акаунти</div>
          {accounts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><IconTelegram size={20} /></div>
              <div>
                <strong>Ще немає підключених акаунтів</strong>
                <p>Після підключення Telegram-акаунт з’явиться у цьому списку.</p>
              </div>
            </div>
          ) : (
            <div className={styles.accountList}>
              {accounts.map(account => (
                <div className={styles.accountRow} key={account.id}>
                  <div className={styles.accountAvatar}>{account.displayName.slice(0, 1)}</div>
                  <div className={styles.accountInfo}>
                    <strong>{account.displayName}</strong>
                    <span>{account.username}</span>
                  </div>
                  <span className={styles.connectedBadge}><IconCheck /> Підключено</span>
                  <span className={styles.accountDate}>{account.connectedAt}</span>
                  <button className={styles.iconBtn} aria-label="Видалити акаунт" onClick={() => setAccounts(current => current.filter(item => item.id !== account.id))}>
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
            <select value={currency} onChange={event => setCurrency(event.target.value)}>
              <option value="UAH">Українська гривня (₴)</option>
              <option value="USD">Долар США ($)</option>
              <option value="EUR">Євро (€)</option>
              <option value="PLN">Польський злотий (zł)</option>
            </select>
          </Field>
          <Field label="Мова застосунку" hint="Перемикач поки працює лише візуально.">
            <select value={language} onChange={event => setLanguage(event.target.value)}>
              <option value="uk">Українська</option>
              <option value="en">English</option>
              <option value="pl">Polski</option>
            </select>
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
              <input type="number" min="1" value={minGap} onChange={event => setMinGap(event.target.value)} />
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
            description="Нагадувати про борг до дедлайну та повторювати нагадування, доки його не закрито або не позначено як прочитане."
            checked={notifications.debtDeadline}
            onChange={() => toggleNotification("debtDeadline")}
          >
            <div className={styles.inlineOptions}>
              <label>
                <span>Нагадати за</span>
                <select value={debtReminderBefore} onChange={event => setDebtReminderBefore(event.target.value)}>
                  <option value="1">1 день</option>
                  <option value="3">3 дні</option>
                  <option value="7">7 днів</option>
                </select>
              </label>
              <label>
                <span>Повторювати кожні</span>
                <select value={debtRepeat} onChange={event => setDebtRepeat(event.target.value)}>
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

      {connectData && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setConnectData(null)}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Підключити Telegram-бота" onMouseDown={event => event.stopPropagation()}>
            <div className={styles.modalIcon}><IconTelegram size={23} /></div>
            <h2>Підключення Telegram-бота</h2>
            <p className={styles.modalText}>Перейдіть за посиланням і надішліть боту одноразовий код. Код діє лише для одного підключення.</p>

            <div className={styles.connectBlock}>
              <span>Одноразовий код</span>
              <div className={styles.copyRow}>
                <strong className={styles.code}>{connectData.code}</strong>
                <button className={styles.copyBtn} onClick={() => copyText(connectData.code, "code")}>
                  {copied === "code" ? <IconCheck /> : <IconCopy />}
                  {copied === "code" ? "Скопійовано" : "Копіювати"}
                </button>
              </div>
            </div>

            <div className={styles.connectBlock}>
              <span>Посилання на бота</span>
              <div className={styles.copyRow}>
                <a href={connectData.link} target="_blank" rel="noreferrer">{connectData.link}</a>
                <button className={styles.copyBtn} onClick={() => copyText(connectData.link, "link")}>
                  {copied === "link" ? <IconCheck /> : <IconCopy />}
                  {copied === "link" ? "Скопійовано" : "Копіювати"}
                </button>
              </div>
            </div>

            <div className={styles.modalHint}>Для перевірки макета натисніть кнопку нижче — вона імітує успішне підключення без бекенду.</div>
            <div className={styles.modalActions}>
              <button className={styles.secondaryBtn} onClick={() => setConnectData(null)}>Скасувати</button>
              <button className={styles.primaryBtn} onClick={simulateConnection}>Імітувати підключення</button>
            </div>
          </div>
        </div>
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
