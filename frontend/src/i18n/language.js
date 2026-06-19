const STORAGE_KEY = "budgetflow.language";
const SUPPORTED_LANGUAGES = ["uk", "en", "pl"];

const EN = {
  Тема: "Theme",
  "Як у системі": "System default",
  Світла: "Light",
  Темна: "Dark",
  "Автоматично підлаштовується під пристрій": "Automatically adapts to your device",
  "Поточна світла палітра": "Current light palette",
  "М'який темний інтерфейс": "Soft dark interface",
  "Вибір тему застосунку": "Choose the app theme",

  Вхід: "Login",
  "Вхід...": "Signing in...",
  Увійти: "Sign in",
  "Немає акаунту?": "No account?",
  Реєстрація: "Registration",
  "Реєстрація...": "Creating account...",
  Зареєструватися: "Sign up",
  "Вже є акаунт?": "Already have an account?",
  Імʼя: "Name",
  Пароль: "Password",
  "Неправильний email або пароль": "Incorrect email or password",
  "Помилка реєстрації": "Registration error",

  "Особисті фінанси": "Personal finance",
  Витрати: "Expenses",
  Основне: "Main",
  "Таблиця витрат": "Expense table",
  Таблиця: "Table",
  Статистика: "Stats",
  "Планування бюджету": "Budget planning",
  Бюджет: "Budget",
  Борги: "Debts",
  Накопичення: "Savings",
  Профіль: "Profile",
  Налаштування: "Settings",
  "Сканувати чек": "Scan receipt",
  Сканувати: "Scan",
  "Додати запис": "Add entry",
  "Мобільна навігація": "Mobile navigation",
  Ще: "More",
  "Закрити меню": "Close menu",
  "Додаткові розділи": "More sections",
  "Додаткові розділи застосунку": "More app sections",
  "Пошук за місцем, сумою, нотатками…": "Search by place, amount, notes...",
  "Завантаження…": "Loading...",
  "Видалити цей запис?": "Delete this entry?",
  "Розпізнано:": "Recognized:",

  "Фільтр:": "Filter:",
  Скинути: "Reset",
  Дата: "Date",
  Сума: "Amount",
  Місця: "Places",
  Місце: "Place",
  Деталі: "Details",
  Дії: "Actions",
  "Нічого не знайдено": "Nothing found",
  Редагувати: "Edit",
  Видалити: "Delete",
  "0 записів": "0 entries",
  "← Назад": "← Back",
  "Вперед →": "Next →",
  "Загальні витрати": "Total expenses",
  "Середня витрата": "Average expense",
  "Максимальний запис": "Largest entry",
  "на запис": "per entry",
  "найбільша витрата": "largest expense",

  "Новий запис": "New entry",
  "Редагувати запис": "Edit entry",
  Валюта: "Currency",
  "+ Додати місце": "+ Add place",
  "Деталі / продукти": "Details / products",
  Нотатки: "Notes",
  "Тег, наприклад: на макбук": "Tag, for example: macbook",
  "+ Тег": "+ Tag",
  "Загалом:": "Total:",
  Скасувати: "Cancel",
  Зберегти: "Save",
  "Вкажіть дату": "Choose a date",
  "Додайте хоча б одне місце": "Add at least one place",
  "Показати список місць": "Show place list",
  "Польський злотий": "Polish zloty",
  Євро: "Euro",
  "Долар США": "US dollar",
  Гривня: "Ukrainian hryvnia",
  "Британський фунт": "British pound",
  "Швейцарський франк": "Swiss franc",
  "Чеська крона": "Czech koruna",
  "Шведська крона": "Swedish krona",
  "Норвезька крона": "Norwegian krone",
  "Данська крона": "Danish krone",
  "Угорський форинт": "Hungarian forint",
  "Румунський лей": "Romanian leu",
  "Болгарський лев": "Bulgarian lev",
  "Хорватська куна": "Croatian kuna",
  "Японська єна": "Japanese yen",
  "Китайський юань": "Chinese yuan",
  "Канадський долар": "Canadian dollar",
  "Австралійський долар": "Australian dollar",

  Огляд: "Overview",
  "Топ витрат": "Top expenses",
  "Активних днів": "Active days",
  "7 днів": "7 days",
  Місяць: "Month",
  "3 місяці": "3 months",
  Рік: "Year",
  Все: "All",
  "Витрати по днях": "Expenses by day",
  "Топ місць — загальна сума": "Top places by total",
  "Розподіл витрат по місцях": "Expense split by place",
  "Витрати за місцем": "Expenses by place",
  "Немає записів у вибраному діапазоні": "No entries in the selected range",
  Разом: "Total",
  Записів: "Entries",
  Середнє: "Average",
  "Оберіть місце вище, щоб побачити всі витрати по ньому":
    "Choose a place above to see all expenses for it",
  "Топ-10 найбільших витрат": "Top 10 largest expenses",
  "Частота відвідувань місць": "Place visit frequency",

  "Борговий баланс": "Debt balance",
  "Контролюй обидві сторони": "Control both sides",
  "Я винен": "I owe",
  "Мої зобов’язання": "My obligations",
  "Винні мені": "Owed to me",
  "Мої позики": "My loans",
  Всі: "All",
  "Не закрито": "Open",
  Прострочено: "Overdue",
  Частково: "Partial",
  Закрито: "Closed",
  "Всі типи": "All types",
  "💸 Разові": "💸 One-time",
  "🏦 Кредити": "🏦 Installments",
  "🔁 Регулярні": "🔁 Recurring",
  Пріоритет: "Priority",
  Термін: "Due date",
  Статус: "Status",
  "Видалити запис про позику?": "Delete this loan record?",
  "Видалити цей борг?": "Delete this debt?",
  "Мені мають повернути": "Owed to me",
  "Загальний борг": "Total debt",
  "Повернень цього міс": "Returns this month",
  "Платежів цього міс": "Payments this month",
  "Всього позик": "Total loans",
  "Всього боргів": "Total debts",
  "+ Записати позику": "+ Record loan",
  "+ Новий борг": "+ New debt",
  "Завантаження боргів…": "Loading debts...",
  "Ніхто нічого не винен": "No one owes anything",
  "Боргів не знайдено": "No debts found",
  "Записати першу позику": "Record first loan",
  "Додати перший борг": "Add first debt",
  "Записати позику": "Record loan",
  "Додати борг": "Add debt",
  Позика: "Loan",
  Борг: "Debt",

  "Цілі без зайвого шуму": "Goals without noise",
  "Створюй банки для великих покупок і додавай внески вручну або тегами з таблиці витрат.":
    "Create jars for big purchases and add contributions manually or by tags from the expense table.",
  "＋ Нова банка": "+ New jar",
  "Усього накопичено": "Total saved",
  "Активних банок": "Active jars",
  "Автоматичні теги": "Automatic tags",
  "Завантаження накопичень…": "Loading savings...",
  "Поки що немає жодної банки": "No jars yet",
  "Створи першу ціль, наприклад «На MacBook», і додавай внески у кілька кліків.":
    'Create your first goal, for example "For a MacBook", and add contributions in a few clicks.',
  "Створити першу банку": "Create first jar",
  "Особиста фінансова ціль": "Personal financial goal",
  "Без фінального ліміту": "No final limit",

  "Планування без зайвих таблиць": "Planning without extra spreadsheets",
  "Ваші бюджети": "Your budgets",
  "Поточний місяць завжди під рукою. Майбутні плани зберігаються як чернетки й автоматично стають активними у свій час.":
    "The current month stays close at hand. Future plans are saved as drafts and become active automatically when their time comes.",
  "＋ Створити бюджет": "+ Create budget",
  "Активних бюджетів": "Active budgets",
  "Запланованих місяців": "Planned months",
  "Усього заплановано": "Total planned",
  Щомісяця: "Monthly",
  "Регулярний контроль": "Regular control",
  "Новий щомісячний бюджет": "New monthly budget",
  "Створити за кілька кліків": "Create in a few clicks",
  "Події та цілі": "Events and goals",
  "Окремі плани": "Separate plans",
  "Нова подія або ціль": "New event or goal",
  "Поїздка, ремонт чи покупка": "Trip, repair, or purchase",
  "Згорнути список": "Collapse list",
  "Поки що це чернетка. Вона стане активною автоматично.":
    "This is a draft for now. It will become active automatically.",
  "Категорії бюджету": "Budget categories",
  "Автоматичний контроль": "Automatic control",
  "Витрати автоматично потрапляють у категорії за вибраними місцями та кастомними мітками.":
    "Expenses automatically land in categories by selected places and custom tags.",
  "Регулярні платежі": "Regular payments",
  "Обов’язкові витрати": "Mandatory expenses",
  "Стають оплаченими лише після реальної транзакції з відповідною міткою.":
    "They become paid only after a real transaction with the matching tag.",
  Надходження: "Income",
  "Очікувані доходи": "Expected income",
  "Фінансовий асистент": "Financial assistant",
  "Є категорії, які потребують уваги": "Some categories need attention",
  "Бюджет під контролем": "Budget under control",
  "Нагадування в Telegram": "Telegram reminders",
  "Календар витрат": "Expense calendar",
  Список: "List",
  Календар: "Calendar",
  Залишилось: "Remaining",
  "Днів залишилось": "Days left",
  "Доступно на день": "Available per day",
  "Прогноз на кінець": "End forecast",
  Учасників: "Participants",
  "Це запланований бюджет-чернетка": "This is a planned draft budget",
  "Налаштуйте його заздалегідь. У день початку періоду він автоматично стане активним.":
    "Set it up ahead of time. On the start date it will become active automatically.",
  "← Усі бюджети": "← All budgets",
  "⎘ Скопіювати минулий місяць": "⎘ Copy previous month",
  "◷ Планувати наперед": "◷ Plan ahead",
  "↗ Поділитися": "↗ Share",
  "＋ Додати": "+ Add",
  "Оплачено реальною транзакцією": "Paid by real transaction",
  "Очікує транзакцію": "Waiting for transaction",
  Отримано: "Received",
  Очікується: "Expected",

  "Конфігурація застосунку та підключених сервісів.": "App and connected services configuration.",
  "Збереження…": "Saving...",
  "Збережено в акаунті": "Saved to account",
  "Telegram-бот": "Telegram bot",
  "Підключіть Telegram-акаунт для отримання сповіщень.":
    "Connect a Telegram account to receive notifications.",
  Підключити: "Connect",
  "Підключені акаунти": "Connected accounts",
  "Ще немає підключених акаунтів": "No connected accounts yet",
  "Після надсилання одноразового коду боту акаунт з’явиться у цьому списку.":
    "After sending a one-time code to the bot, the account will appear in this list.",
  Підключено: "Connected",
  "Видалити акаунт": "Remove account",
  "Основні налаштування": "Main settings",
  "Параметри відображення застосунку.": "App display options.",
  "Основна валюта": "Base currency",
  "Використовується для відображення сум у застосунку.": "Used to display amounts in the app.",
  "Мова застосунку": "App language",
  "Зберігається в налаштуваннях профілю.": "Saved in profile settings.",
  "Розмір шрифту": "Font size",
  "Змінюється лише в безпечному діапазоні, щоб картки та кнопки не ламалися.":
    "Changes only within a safe range so cards and buttons do not break.",
  Українська: "Ukrainian",
  "Українська гривня (₴)": "Ukrainian hryvnia (₴)",
  "Долар США ($)": "US dollar ($)",
  "Євро (€)": "Euro (€)",
  "Польський злотий (zł)": "Polish zloty (zł)",
  Сповіщення: "Notifications",
  "Налаштування повідомлень, які надсилатиме Telegram-бот.":
    "Settings for messages the Telegram bot will send.",
  "Підключіть Telegram-бота": "Connect the Telegram bot",
  "Мінімальний інтервал між сповіщеннями": "Minimum gap between notifications",
  "Не надсилати повідомлення частіше, ніж вказано нижче.":
    "Do not send notifications more often than specified below.",
  хв: "min",
  "Наближення до ліміту бюджету": "Approaching budget limit",
  "Попереджати, коли витрати категорії наближаються до верхньої межі.":
    "Warn when category spending is getting close to the upper limit.",
  "Додавання нового запису": "New entry added",
  "Надсилати коротке підтвердження після додавання витрати або доходу.":
    "Send a short confirmation after adding an expense or income.",
  "Дедлайн оплати боргу": "Debt payment deadline",
  "Нагадувати про борг до дедлайну та повторювати нагадування, доки його не закрито.":
    "Remind about debt before the deadline and repeat until it is closed.",
  "Нагадати за": "Remind before",
  "Повторювати кожні": "Repeat every",
  "1 день": "1 day",
  "3 дні": "3 days",
  "7 днів": "7 days",
  "6 годин": "6 hours",
  "12 годин": "12 hours",
  "24 години": "24 hours",
  "48 годин": "48 hours",
  "Підключення Telegram-бота": "Connect Telegram bot",
  "Одноразовий код": "One-time code",
  "Посилання на бота": "Bot link",
  Скопійовано: "Copied",
  Копіювати: "Copy",
  Закрити: "Close",
  "Оновити список": "Refresh list",
  Компактний: "Compact",
  "Трохи більше простору на екрані": "A little more space on screen",
  Стандартний: "Standard",
  "Оптимальний розмір для більшості екранів": "Optimal size for most screens",
  Збільшений: "Large",
  "Комфортніше читати без перебудови інтерфейсу": "Easier to read without rebuilding the layout",
  Максимальний: "Maximum",
  "Максимально збільшений": "Maximum increase",

  "Завантажте фото чека — запис додається автоматично":
    "Upload a receipt photo. Currently optimized for Polish receipts.",
  "Перетягніть фото або": "Drop a photo or",
  "виберіть файл": "choose a file",
  "JPG, PNG, WEBP — до 10 МБ": "JPG, PNG, WEBP, up to 10 MB",
  Чек: "Receipt",
  Замінити: "Replace",
  "Помилка сервера": "Server error",
  "Чек успішно розпізнано!": "Receipt recognized successfully!",
  "Обробка...": "Processing...",
  "Розпізнати чек": "Recognize receipt",
};

const PL = {
  Тема: "Motyw",
  "Як у системі": "Jak w systemie",
  Світла: "Jasna",
  Темна: "Ciemna",
  "Автоматично підлаштовується під пристрій": "Automatycznie dostosowuje się do urządzenia",
  "Поточна світла палітра": "Aktualna jasna paleta",
  "М'який темний інтерфейс": "Łagodny ciemny interfejs",
  "Вибір тему застосунку": "Wybór motywu aplikacji",
  Вхід: "Logowanie",
  "Вхід...": "Logowanie...",
  Увійти: "Zaloguj się",
  "Немає акаунту?": "Nie masz konta?",
  Реєстрація: "Rejestracja",
  "Реєстрація...": "Tworzenie konta...",
  Зареєструватися: "Zarejestruj się",
  "Вже є акаунт?": "Masz już konto?",
  Імʼя: "Imię",
  Пароль: "Hasło",
  "Неправильний email або пароль": "Nieprawidłowy email lub hasło",
  "Помилка реєстрації": "Błąd rejestracji",

  "Особисті фінанси": "Finanse osobiste",
  Витрати: "Wydatki",
  Основне: "Główne",
  "Таблиця витрат": "Tabela wydatków",
  Таблиця: "Tabela",
  Статистика: "Statystyki",
  "Планування бюджету": "Planowanie budżetu",
  Бюджет: "Budżet",
  Борги: "Długi",
  Накопичення: "Oszczędności",
  Профіль: "Profil",
  Налаштування: "Ustawienia",
  "Сканувати чек": "Skanuj paragon",
  Сканувати: "Skanuj",
  "Додати запис": "Dodaj wpis",
  "Мобільна навігація": "Nawigacja mobilna",
  Ще: "Więcej",
  "Закрити меню": "Zamknij menu",
  "Додаткові розділи": "Dodatkowe sekcje",
  "Додаткові розділи застосунку": "Dodatkowe sekcje aplikacji",
  "Пошук за місцем, сумою, нотатками…": "Szukaj po miejscu, kwocie, notatkach...",
  "Завантаження…": "Ładowanie...",
  "Видалити цей запис?": "Usunąć ten wpis?",
  "Розпізнано:": "Rozpoznano:",

  "Фільтр:": "Filtr:",
  Скинути: "Resetuj",
  Дата: "Data",
  Сума: "Kwota",
  Місця: "Miejsca",
  Місце: "Miejsce",
  Деталі: "Szczegóły",
  Дії: "Akcje",
  "Нічого не знайдено": "Nic nie znaleziono",
  Редагувати: "Edytuj",
  Видалити: "Usuń",
  "0 записів": "0 wpisów",
  "← Назад": "← Wstecz",
  "Вперед →": "Dalej →",
  "Загальні витрати": "Łączne wydatki",
  "Середня витрата": "Średni wydatek",
  "Максимальний запис": "Największy wpis",
  "на запис": "na wpis",
  "найбільша витрата": "największy wydatek",

  "Новий запис": "Nowy wpis",
  "Редагувати запис": "Edytuj wpis",
  Валюта: "Waluta",
  "+ Додати місце": "+ Dodaj miejsce",
  "Деталі / продукти": "Szczegóły / produkty",
  Нотатки: "Notatki",
  "Тег, наприклад: на макбук": "Tag, np. macbook",
  "+ Тег": "+ Tag",
  "Загалом:": "Razem:",
  Скасувати: "Anuluj",
  Зберегти: "Zapisz",
  "Вкажіть дату": "Wybierz datę",
  "Додайте хоча б одне місце": "Dodaj przynajmniej jedno miejsce",
  "Показати список місць": "Pokaż listę miejsc",
  "Польський злотий": "Polski złoty",
  Євро: "Euro",
  "Долар США": "Dolar amerykański",
  Гривня: "Hrywna ukraińska",
  "Британський фунт": "Funt brytyjski",
  "Швейцарський франк": "Frank szwajcarski",
  "Чеська крона": "Korona czeska",
  "Шведська крона": "Korona szwedzka",
  "Норвезька крона": "Korona norweska",
  "Данська крона": "Korona duńska",
  "Угорський форинт": "Forint węgierski",
  "Румунський лей": "Lej rumuński",
  "Болгарський лев": "Lew bułgarski",
  "Хорватська куна": "Kuna chorwacka",
  "Японська єна": "Jen japoński",
  "Китайський юань": "Juan chiński",
  "Канадський долар": "Dolar kanadyjski",
  "Австралійський долар": "Dolar australijski",

  Огляд: "Przegląd",
  "Топ витрат": "Największe wydatki",
  "Активних днів": "Aktywne dni",
  "7 днів": "7 dni",
  Місяць: "Miesiąc",
  "3 місяці": "3 miesiące",
  Рік: "Rok",
  Все: "Wszystko",
  "Витрати по днях": "Wydatki według dni",
  "Топ місць — загальна сума": "Top miejsc według sumy",
  "Розподіл витрат по місцях": "Podział wydatków według miejsc",
  "Витрати за місцем": "Wydatki według miejsca",
  "Немає записів у вибраному діапазоні": "Brak wpisów w wybranym zakresie",
  Разом: "Razem",
  Записів: "Wpisy",
  Середнє: "Średnio",
  "Оберіть місце вище, щоб побачити всі витрати по ньому":
    "Wybierz miejsce powyżej, aby zobaczyć wszystkie jego wydatki",
  "Топ-10 найбільших витрат": "Top 10 największych wydatków",
  "Частота відвідувань місць": "Częstotliwość odwiedzin miejsc",

  "Борговий баланс": "Bilans długów",
  "Контролюй обидві сторони": "Kontroluj obie strony",
  "Я винен": "Jestem winien",
  "Мої зобов’язання": "Moje zobowiązania",
  "Винні мені": "Winni mi",
  "Мої позики": "Moje pożyczki",
  Всі: "Wszystkie",
  "Не закрито": "Otwarte",
  Прострочено: "Po terminie",
  Частково: "Częściowo",
  Закрито: "Zamknięte",
  "Всі типи": "Wszystkie typy",
  "💸 Разові": "💸 Jednorazowe",
  "🏦 Кредити": "🏦 Raty",
  "🔁 Регулярні": "🔁 Regularne",
  Пріоритет: "Priorytet",
  Термін: "Termin",
  Статус: "Status",
  "Видалити запис про позику?": "Usunąć zapis pożyczki?",
  "Видалити цей борг?": "Usunąć ten dług?",
  "Мені мають повернути": "Do zwrotu dla mnie",
  "Загальний борг": "Łączny dług",
  "Повернень цього міс": "Zwroty w tym mies.",
  "Платежів цього міс": "Płatności w tym mies.",
  "Всього позик": "Łącznie pożyczek",
  "Всього боргів": "Łącznie długów",
  "+ Записати позику": "+ Zapisz pożyczkę",
  "+ Новий борг": "+ Nowy dług",
  "Завантаження боргів…": "Ładowanie długów...",
  "Ніхто нічого не винен": "Nikt nic nie jest winien",
  "Боргів не знайдено": "Nie znaleziono długów",
  "Записати першу позику": "Zapisz pierwszą pożyczkę",
  "Додати перший борг": "Dodaj pierwszy dług",
  "Записати позику": "Zapisz pożyczkę",
  "Додати борг": "Dodaj dług",
  Позика: "Pożyczka",
  Борг: "Dług",

  "Цілі без зайвого шуму": "Cele bez zbędnego szumu",
  "Створюй банки для великих покупок і додавай внески вручну або тегами з таблиці витрат.":
    "Twórz słoiki na większe zakupy i dodawaj wpłaty ręcznie albo tagami z tabeli wydatków.",
  "＋ Нова банка": "+ Nowy słoik",
  "Усього накопичено": "Łącznie oszczędzono",
  "Активних банок": "Aktywne słoiki",
  "Автоматичні теги": "Automatyczne tagi",
  "Завантаження накопичень…": "Ładowanie oszczędności...",
  "Поки що немає жодної банки": "Nie ma jeszcze żadnego słoika",
  "Створи першу ціль, наприклад «На MacBook», і додавай внески у кілька кліків.":
    'Utwórz pierwszy cel, np. "Na MacBooka", i dodawaj wpłaty w kilku kliknięciach.',
  "Створити першу банку": "Utwórz pierwszy słoik",
  "Особиста фінансова ціль": "Osobisty cel finansowy",
  "Без фінального ліміту": "Bez limitu końcowego",

  "Планування без зайвих таблиць": "Planowanie bez dodatkowych arkuszy",
  "Ваші бюджети": "Twoje budżety",
  "Поточний місяць завжди під рукою. Майбутні плани зберігаються як чернетки й автоматично стають активними у свій час.":
    "Bieżący miesiąc jest zawsze pod ręką. Przyszłe plany są zapisane jako wersje robocze i aktywują się automatycznie w odpowiednim czasie.",
  "＋ Створити бюджет": "+ Utwórz budżet",
  "Активних бюджетів": "Aktywne budżety",
  "Запланованих місяців": "Zaplanowane miesiące",
  "Усього заплановано": "Łącznie zaplanowano",
  Щомісяця: "Co miesiąc",
  "Регулярний контроль": "Regularna kontrola",
  "Новий щомісячний бюджет": "Nowy miesięczny budżet",
  "Створити за кілька кліків": "Utwórz w kilku kliknięciach",
  "Події та цілі": "Wydarzenia i cele",
  "Окремі плани": "Osobne plany",
  "Нова подія або ціль": "Nowe wydarzenie lub cel",
  "Поїздка, ремонт чи покупка": "Podróż, remont lub zakup",
  "Згорнути список": "Zwiń listę",
  "Поки що це чернетка. Вона стане активною автоматично.":
    "Na razie to wersja robocza. Aktywuje się automatycznie.",
  "Категорії бюджету": "Kategorie budżetu",
  "Автоматичний контроль": "Automatyczna kontrola",
  "Витрати автоматично потрапляють у категорії за вибраними місцями та кастомними мітками.":
    "Wydatki automatycznie trafiają do kategorii według wybranych miejsc i własnych tagów.",
  "Регулярні платежі": "Regularne płatności",
  "Обов’язкові витрати": "Obowiązkowe wydatki",
  "Стають оплаченими лише після реальної транзакції з відповідною міткою.":
    "Stają się opłacone dopiero po realnej transakcji z odpowiednim tagiem.",
  Надходження: "Przychody",
  "Очікувані доходи": "Oczekiwane przychody",
  "Фінансовий асистент": "Asystent finansowy",
  "Є категорії, які потребують уваги": "Są kategorie wymagające uwagi",
  "Бюджет під контролем": "Budżet pod kontrolą",
  "Нагадування в Telegram": "Przypomnienia w Telegramie",
  "Календар витрат": "Kalendarz wydatków",
  Список: "Lista",
  Календар: "Kalendarz",
  Залишилось: "Pozostało",
  "Днів залишилось": "Dni pozostało",
  "Доступно на день": "Dostępne dziennie",
  "Прогноз на кінець": "Prognoza na koniec",
  Учасників: "Uczestnicy",
  "Це запланований бюджет-чернетка": "To zaplanowany budżet roboczy",
  "Налаштуйте його заздалегідь. У день початку періоду він автоматично стане активним.":
    "Skonfiguruj go wcześniej. W dniu rozpoczęcia okresu aktywuje się automatycznie.",
  "← Усі бюджети": "← Wszystkie budżety",
  "⎘ Скопіювати минулий місяць": "⎘ Skopiuj poprzedni miesiąc",
  "◷ Планувати наперед": "◷ Planuj naprzód",
  "↗ Поділитися": "↗ Udostępnij",
  "＋ Додати": "+ Dodaj",
  "Оплачено реальною транзакцією": "Opłacone realną transakcją",
  "Очікує транзакцію": "Oczekuje transakcji",
  Отримано: "Otrzymano",
  Очікується: "Oczekiwane",

  "Конфігурація застосунку та підключених сервісів.": "Konfiguracja aplikacji i połączonych usług.",
  "Збереження…": "Zapisywanie...",
  "Збережено в акаунті": "Zapisano na koncie",
  "Telegram-бот": "Bot Telegram",
  "Підключіть Telegram-акаунт для отримання сповіщень.":
    "Połącz konto Telegram, aby otrzymywać powiadomienia.",
  Підключити: "Połącz",
  "Підключені акаунти": "Połączone konta",
  "Ще немає підключених акаунтів": "Nie ma jeszcze połączonych kont",
  "Після надсилання одноразового коду боту акаунт з’явиться у цьому списку.":
    "Po wysłaniu jednorazowego kodu do bota konto pojawi się na tej liście.",
  Підключено: "Połączono",
  "Видалити акаунт": "Usuń konto",
  "Основні налаштування": "Główne ustawienia",
  "Параметри відображення застосунку.": "Opcje wyświetlania aplikacji.",
  "Основна валюта": "Waluta bazowa",
  "Використовується для відображення сум у застосунку.":
    "Używana do wyświetlania kwot w aplikacji.",
  "Мова застосунку": "Język aplikacji",
  "Зберігається в налаштуваннях профілю.": "Zapisywany w ustawieniach profilu.",
  "Розмір шрифту": "Rozmiar czcionki",
  "Змінюється лише в безпечному діапазоні, щоб картки та кнопки не ламалися.":
    "Zmienia się tylko w bezpiecznym zakresie, aby karty i przyciski się nie psuły.",
  Українська: "Ukraiński",
  "Українська гривня (₴)": "Hrywna ukraińska (₴)",
  "Долар США ($)": "Dolar amerykański ($)",
  "Євро (€)": "Euro (€)",
  "Польський злотий (zł)": "Polski złoty (zł)",
  Сповіщення: "Powiadomienia",
  "Налаштування повідомлень, які надсилатиме Telegram-бот.":
    "Ustawienia wiadomości wysyłanych przez bota Telegram.",
  "Підключіть Telegram-бота": "Połącz bota Telegram",
  "Мінімальний інтервал між сповіщеннями": "Minimalny odstęp między powiadomieniami",
  "Не надсилати повідомлення частіше, ніж вказано нижче.":
    "Nie wysyłaj powiadomień częściej niż podano poniżej.",
  хв: "min",
  "Наближення до ліміту бюджету": "Zbliżanie się do limitu budżetu",
  "Попереджати, коли витрати категорії наближаються до верхньої межі.":
    "Ostrzegaj, gdy wydatki kategorii zbliżają się do górnej granicy.",
  "Додавання нового запису": "Dodanie nowego wpisu",
  "Надсилати коротке підтвердження після додавання витрати або доходу.":
    "Wysyłaj krótkie potwierdzenie po dodaniu wydatku lub przychodu.",
  "Дедлайн оплати боргу": "Termin płatności długu",
  "Нагадувати про борг до дедлайну та повторювати нагадування, доки його не закрито.":
    "Przypominaj o długu przed terminem i powtarzaj, dopóki nie zostanie zamknięty.",
  "Нагадати за": "Przypomnij przed",
  "Повторювати кожні": "Powtarzaj co",
  "1 день": "1 dzień",
  "3 дні": "3 dni",
  "7 днів": "7 dni",
  "6 годин": "6 godzin",
  "12 годин": "12 godzin",
  "24 години": "24 godziny",
  "48 годин": "48 godzin",
  "Підключення Telegram-бота": "Połączenie bota Telegram",
  "Одноразовий код": "Kod jednorazowy",
  "Посилання на бота": "Link do bota",
  Скопійовано: "Skopiowano",
  Копіювати: "Kopiuj",
  Закрити: "Zamknij",
  "Оновити список": "Odśwież listę",
  Компактний: "Kompaktowy",
  "Трохи більше простору на екрані": "Trochę więcej miejsca na ekranie",
  Стандартний: "Standardowy",
  "Оптимальний розмір для більшості екранів": "Optymalny rozmiar dla większości ekranów",
  Збільшений: "Powiększony",
  "Комфортніше читати без перебудови інтерфейсу": "Wygodniejsze czytanie bez przebudowy interfejsu",
  Максимальний: "Maksymalny",
  "Максимально збільшений": "Maksymalnie powiększony",

  "Завантажте фото чека — запис додається автоматично":
    "Prześlij zdjęcie paragonu. Obecnie zoptymalizowane dla polskich paragonów.",
  "Перетягніть фото або": "Przeciągnij zdjęcie albo",
  "виберіть файл": "wybierz plik",
  "JPG, PNG, WEBP — до 10 МБ": "JPG, PNG, WEBP, do 10 MB",
  Чек: "Paragon",
  Замінити: "Zamień",
  "Помилка сервера": "Błąd serwera",
  "Чек успішно розпізнано!": "Paragon rozpoznany pomyślnie!",
  "Обробка...": "Przetwarzanie...",
  "Розпізнати чек": "Rozpoznaj paragon",
};

const DICTIONARIES = { en: EN, pl: PL };
const reverseIndex = new Map();
let activeLanguage = "uk";
let observer = null;
let scheduled = false;

for (const [language, dictionary] of Object.entries(DICTIONARIES)) {
  for (const [source, translated] of Object.entries(dictionary)) {
    reverseIndex.set(translated, source);
    reverseIndex.set(source, source);
    if (language === "pl" && EN[source]) reverseIndex.set(EN[source], source);
  }
}

export function normalizeLanguage(value) {
  const code = String(value || "")
    .trim()
    .toLowerCase()
    .split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(code) ? code : "en";
}

export function detectInterfaceLanguage() {
  const languages =
    typeof navigator === "undefined"
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : [navigator.language];
  for (const language of languages) {
    const normalized = normalizeLanguage(language);
    if (
      normalized !== "en" ||
      String(language || "")
        .toLowerCase()
        .startsWith("en")
    ) {
      return normalized;
    }
  }
  return "en";
}

export function getInitialLanguage() {
  if (typeof localStorage === "undefined") return detectInterfaceLanguage();
  return normalizeLanguage(localStorage.getItem(STORAGE_KEY) || detectInterfaceLanguage());
}

export function getActiveLanguage() {
  return activeLanguage;
}

export function applyLanguage(language) {
  activeLanguage = normalizeLanguage(language);
  if (typeof document !== "undefined") {
    document.documentElement.lang = activeLanguage;
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, activeLanguage);
  }
  scheduleTranslate();
  window.dispatchEvent(
    new CustomEvent("app-language-applied", { detail: { language: activeLanguage } })
  );
  return activeLanguage;
}

export function startDomTranslator() {
  if (typeof document === "undefined" || observer) return;
  observer = new MutationObserver(() => scheduleTranslate());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "title", "aria-label", "alt"],
  });
  scheduleTranslate();
}

function scheduleTranslate() {
  if (typeof window === "undefined" || scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    translateDocument();
  });
}

function translateDocument() {
  if (typeof document === "undefined") return;
  translateElement(document.body);
  translateAttributes(document.body);
}

function translateElement(element) {
  if (!element) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    const next = translateText(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  });
}

function translateAttributes(root) {
  if (!root) return;
  const elements = root.querySelectorAll("[placeholder], [title], [aria-label], [alt]");
  elements.forEach((element) => {
    ["placeholder", "title", "aria-label", "alt"].forEach((attr) => {
      if (!element.hasAttribute(attr)) return;
      const current = element.getAttribute(attr);
      const next = translateText(current);
      if (next !== current) element.setAttribute(attr, next);
    });
  });
}

function translateText(value) {
  if (!value) return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  const core = value.trim();
  if (!core) return value;

  const translated = translateCore(core);
  return translated === core ? value : `${leading}${translated}${trailing}`;
}

function translateCore(value) {
  const source = reverseIndex.get(value) || value;
  if (activeLanguage === "uk") return source;

  const dictionary = DICTIONARIES[activeLanguage] || EN;
  if (dictionary[source]) return dictionary[source];

  const dynamic = translateDynamic(source, dictionary);
  return dynamic || source;
}

function translateDynamic(value, dictionary) {
  let match = value.match(/^(\d+) записів$/);
  if (match) return activeLanguage === "pl" ? `${match[1]} wpisów` : `${match[1]} entries`;

  match = value.match(/^(\d+) з (\d+) записів$/);
  if (match)
    return activeLanguage === "pl"
      ? `${match[1]} z ${match[2]} wpisów`
      : `${match[1]} of ${match[2]} entries`;

  match = value.match(/^([0-9]+)–([0-9]+) з ([0-9]+)$/);
  if (match)
    return activeLanguage === "pl"
      ? `${match[1]}–${match[2]} z ${match[3]}`
      : `${match[1]}–${match[2]} of ${match[3]}`;

  match = value.match(/^Показати всі бюджети · (.+)$/);
  if (match)
    return activeLanguage === "pl"
      ? `Pokaż wszystkie budżety · ${match[1]}`
      : `Show all budgets · ${match[1]}`;

  match = value.match(/^Використано (.+) із (.+)$/);
  if (match)
    return activeLanguage === "pl"
      ? `Wykorzystano ${match[1]} z ${match[2]}`
      : `Used ${match[1]} of ${match[2]}`;

  match = value.match(/^із (.+)$/);
  if (match) return activeLanguage === "pl" ? `z ${match[1]}` : `of ${match[1]}`;

  match = value.match(/^Очікується (.+)$/);
  if (match) return activeLanguage === "pl" ? `Oczekiwane ${match[1]}` : `Expected ${match[1]}`;

  match = value.match(/^ціль (.+)$/);
  if (match) return activeLanguage === "pl" ? `cel ${match[1]}` : `target ${match[1]}`;

  match = value.match(/^макс\. (.+)$/);
  if (match) return activeLanguage === "pl" ? `maks. ${match[1]}` : `max ${match[1]}`;

  if (dictionary[value]) return dictionary[value];
  return null;
}
