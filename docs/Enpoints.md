# API endpoints

The paths below are relative to the API. In production, the frontend proxies the API through `/api`; for example, `GET /transactions` is called as `GET /api/transactions`.

All requests and responses use camelCase JSON unless stated otherwise. Dates use ISO 8601. Endpoints marked 🔒 require the `Authorization: Bearer <JWT>` header.

## Common responses and validation

- `401` — missing, expired, or invalid JWT: `{ "message": "Сесія закінчилась. Увійдіть ще раз." }`.
- `400` — invalid request body; ASP.NET returns `ValidationProblemDetails`. Where text is stated, the response is a descriptive string.
- `404` — the resource does not exist or is unavailable to the current user.
- Fields marked with `*` are required. Length and range limits appear in parentheses.
- Path parameters `id`, `categoryId`, `itemId`, `entryId`, and `userId` are integers; `token` is a UUID.

## Abbreviated schemas

### Transaction

`TransactionInput`: `counterparty` (≤255), `title` (≤255), `description`, `details`, `amount*` (>0), `currency*` (≤5), `date*`, `type*` (`1` — Income, `2` — Expense), `tags` (string array). For `POST`, `id` may be sent as `0`; `userId` and `userName` are ignored or determined by the server.

`Transaction`: `TransactionInput` + `id`. A list response (`TransactionList`) contains only `counterparty`, `title`, `amount`, `currency`, `date`, `type`, and `tags`.

`GroupedTransaction`: `{ id, date, places: [{ id, name, amount, details, currency, notes, tags }] }`, where `id` and `date` use `YYYY-MM-DD`.

### Debt

`DebtInput`: `direction*` (`payable` | `receivable`), `type*` (`one-time` | `installment` | `recurring`), `creditor*` (≤255), `amount*` (>0), `currency*` (≤5), `dueDate*`, `priority*` (1–5), `notes`; for installments: `totalInstallments`, `paidInstallments`, `monthlyPayment`, `startDate`; for recurring debts: `recurringDay` (1–31), `recurringPeriod`.

`Debt`: `DebtInput` + `id`, `remaining`, `status` (`unpaid` | `overdue` | `partial` | `paid`), `createdAt`, `updatedAt`, `paymentHistory: [{ id, date, amount, note }]`, `installmentSchedule: [{ id, index, date, amount, paid }]`. An `installment` requires `totalInstallments > 0`, `monthlyPayment > 0`, and `startDate`.

`PaymentInput`: `{ amount*: >0, date*, note }`. `RecurringChargeInput`: `{ amount*: >0, dueDate*, note }`.

### Budget

`BudgetInput`: `type*` (`monthly` | `event`), `name*` (≤255), `currency*` (≤5), `totalLimit*` (≥0), `month`, `year`, `startDate`, `endDate`, `telegramEnabled`, `warningThreshold` (1–100), `autoCreateNextMonthly`, `sharingEnabled`, plus the `categories`, `incomeSources`, `mandatoryExpenses`, and `plannedExpenses` arrays.

- A `monthly` budget requires `month` (1–12) and `year`; a user can have only one monthly budget per month.
- An `event` budget requires `startDate` and `endDate`; `endDate` cannot precede `startDate`.
- `Budget` = `BudgetInput` + `id`, `shareToken`, `sharedUsers: [{ userId, name, email }]`. The server may calculate period dates.
- `CategoryInput`: `{ name*: ≤120, icon: ≤30, color: ≤30, limit: ≥0, isActive, labels: string[] }`.
- `IncomeSourceInput`: `{ name*: ≤160, amount*: ≥0, frequency: ≤120, expectedDate, isReceived }`.
- `MandatoryExpenseInput`: `{ budgetCategoryId, name*: ≤160, amount*: ≥0, dueDate, frequency: ≤120, matchLabel: ≤120, isPaid }`.
- `PlannedExpenseInput`: `{ budgetCategoryId, name*: ≤160, amount*: ≥0, date*, isPaid, notes }`.

Budget item operations always return the complete updated `Budget`; the nested item's `id` is not needed in the body (the server creates it or reads it from the path).

### Savings, settings, and Telegram

- `SavingsGoalInput`: `{ name*: ≤160, description: ≤500, targetAmount*: >0, currency*: ≤5, icon*: ≤30, tags: string[] }`.
- `SavingsGoal` = `SavingsGoalInput` + `id`, `entries: [{ id, amount, date, note }]` (newest first). `entries` in the request body are not used when creating or updating a goal.
- `SavingsEntryInput`: `{ amount*: >0, date*, note: ≤500 }`.
- `UserSettings`: `{ baseCurrency*, language*, fontSize*, minimumNotificationGapMinutes*: 1–1440, budgetLimitNotificationsEnabled, newEntryNotificationsEnabled, debtDeadlineNotificationsEnabled, debtReminderBeforeDays: 0–365, debtReminderRepeatHours: 1–720, telegramAccounts }`; `fontSize` is normalized to `compact`, `normal`, or `large`.
- `TelegramAccount`: `{ id, telegramUserId, username, displayName, connectedAt }`.

## Auth

| Method and path | Body / parameters | Successful response | Errors |
|---|---|---|---|
| `POST /auth/login` | `{ email*: email, password*: 6–255 }` | `200 { token }` | `401 "Invalid email or password"`; validation `400` |
| `POST /auth/register` | `{ name*: ≤100, email*: email, password*: 6–255, language?: ≤5 }` | `200 { id, name, email }` | `400 "Email already in use"` or validation error |

## Transactions

| Method and path | Body / parameters | Successful response | Errors |
|---|---|---|---|
| 🔒 `GET /transactions` | — | `200 TransactionList[]` | `401` |
| 🔒 `GET /transactions/{id}` | path: `id` | `200 Transaction` | `401`, `404` |
| 🔒 `POST /transactions` | `TransactionInput` | `201 Transaction`, `Location` header | `401`, validation `400` |
| 🔒 `PUT /transactions/{id}` | path: `id`; `TransactionInput` | `200 Transaction` | `401`, `404`, validation `400` |
| 🔒 `DELETE /transactions/{id}` | path: `id` | `204` | `401`, `404` |
| 🔒 `GET /transactions/grouped` | — | `200 GroupedTransaction[]` | `401` |

## Receipt scan

| Method and path | Body / parameters | Successful response | Errors |
|---|---|---|---|
| 🔒 `POST /receipts` | `multipart/form-data`: a file in `receiptImage` or `receipt` (or the first form file) | `200` — created scanned transaction (`id`, transaction fields, `userId`, `createdAt`, …) | `400 "No image file provided."`; `401`; a recognition failure may return `5xx` |
| 🔒 `POST /scan-receipt` | Same; an alternative absolute route | Same | Same |

## Debts

| Method and path | Body / parameters | Successful response | Errors |
|---|---|---|---|
| 🔒 `GET /debts` | — | `200 Debt[]` | `401` |
| 🔒 `GET /debts/{id}` | path: `id` | `200 Debt` | `401`, `404` |
| 🔒 `POST /debts` | `DebtInput` | `201 Debt`, `Location` | `401`, `400` — invalid direction/type, incomplete installment data, or validation error |
| 🔒 `PUT /debts/{id}` | path: `id`; `DebtInput` | `200 Debt` | `401`, `404`, `400` (as above) |
| 🔒 `DELETE /debts/{id}` | path: `id` | `204` | `401`, `404` |
| 🔒 `POST /debts/{id}/payments` | path: `id`; `PaymentInput` | `200 Debt` | `401`, `404`, `400` — amount exceeds the remaining balance or is ≤0 |
| 🔒 `POST /debts/{id}/mark-paid` | path: `id` | `200 Debt` | `401`, `404` |
| 🔒 `POST /debts/{id}/recurring-charge` | path: `id`; `RecurringChargeInput` | `200 Debt` | `401`, `404`, `400` — debt is not of type `recurring` |

## Budgets

| Method and path | Body / parameters | Successful response | Errors |
|---|---|---|---|
| 🔒 `GET /budgets` | — | `200 Budget[]` (owned and shared) | `401` |
| 🔒 `GET /budgets/{id}` | path: `id` | `200 Budget` | `401`, `404` |
| 🔒 `GET /budgets/shared/{token}` | path: `token` | `200 Budget` | `401`, `403` — shared link is unavailable |
| 🔒 `POST /budgets` | `BudgetInput` | `201 Budget`, `Location` | `401`, `400` — type/period rules or duplicate monthly budget |
| 🔒 `PUT /budgets/{id}` | path: `id`; `BudgetInput` | `200 Budget` | `401`, `404`, `400` — type/period rules or duplicate |
| 🔒 `DELETE /budgets/{id}` | path: `id` | `204` | `401`, `404` |
| 🔒 `POST /budgets/{id}/categories` | `CategoryInput` | `200 Budget` | `401`, `404`, validation `400` |
| 🔒 `PUT /budgets/{id}/categories/{categoryId}` | `CategoryInput` | `200 Budget` | `401`, `404`, validation `400` |
| 🔒 `DELETE /budgets/{id}/categories/{categoryId}` | — | `200 Budget` | `401`, `404` |
| 🔒 `POST /budgets/{id}/income-sources` | `IncomeSourceInput` | `200 Budget` | `401`, `404`, validation `400` |
| 🔒 `PUT /budgets/{id}/income-sources/{itemId}` | `IncomeSourceInput` | `200 Budget` | `401`, `404`, validation `400` |
| 🔒 `DELETE /budgets/{id}/income-sources/{itemId}` | — | `200 Budget` | `401`, `404` |
| 🔒 `POST /budgets/{id}/mandatory-expenses` | `MandatoryExpenseInput` | `200 Budget` | `401`, `404`, validation `400` |
| 🔒 `PUT /budgets/{id}/mandatory-expenses/{itemId}` | `MandatoryExpenseInput` | `200 Budget` | `401`, `404`, validation `400` |
| 🔒 `DELETE /budgets/{id}/mandatory-expenses/{itemId}` | — | `200 Budget` | `401`, `404` |
| 🔒 `POST /budgets/{id}/planned-expenses` | `PlannedExpenseInput` | `200 Budget` | `401`, `404`, validation `400` |
| 🔒 `PUT /budgets/{id}/planned-expenses/{itemId}` | `PlannedExpenseInput` | `200 Budget` | `401`, `404`, validation `400` |
| 🔒 `DELETE /budgets/{id}/planned-expenses/{itemId}` | — | `200 Budget` | `401`, `404` |
| 🔒 `POST /budgets/{id}/shared-users` | `{ email*: email }` | `200 Budget` | `401`, `404`, `400` — user not found or is the owner |
| 🔒 `DELETE /budgets/{id}/shared-users/{userId}` | — | `200 Budget` | `401`, `404` |
| 🔒 `POST /budgets/{id}/sharing?enabled={bool}&regenerateToken={bool}` | query: `enabled*`, `regenerateToken` (defaults to `false`) | `200 Budget` | `401`, `404` |
| 🔒 `POST /budgets/{id}/plan-next-months` | `{ months*: 1–12 }` | `200 Budget[]` — future monthly budgets | `401`, `400` — period is not 1–12 or budget is not `monthly`; no `404` (an id not owned by the user returns `200 []`) |

## Savings goals

| Method and path | Body / parameters | Successful response | Errors |
|---|---|---|---|
| 🔒 `GET /savings-goals` | — | `200 SavingsGoal[]` | `401` |
| 🔒 `GET /savings-goals/{id}` | path: `id` | `200 SavingsGoal` | `401`, `404` |
| 🔒 `POST /savings-goals` | `SavingsGoalInput` | `201 SavingsGoal`, `Location` | `401`, `400` — blank name/currency, target ≤0, or validation error |
| 🔒 `PUT /savings-goals/{id}` | path: `id`; `SavingsGoalInput` | `200 SavingsGoal` | `401`, `404`, `400` (as above) |
| 🔒 `DELETE /savings-goals/{id}` | path: `id` | `204` | `401`, `404` |
| 🔒 `POST /savings-goals/{id}/entries` | `SavingsEntryInput` | `200 SavingsGoal` | `401`, `404`, `400` — amount ≤0 or validation error |
| 🔒 `DELETE /savings-goals/{id}/entries/{entryId}` | — | `200 SavingsGoal` | `401`, `404` |

## User settings and Telegram

| Method and path | Body / parameters | Successful response | Errors |
|---|---|---|---|
| 🔒 `GET /users/settings` | — | `200 UserSettings` | `401` |
| 🔒 `PUT /users/settings` | `UserSettings` without `telegramAccounts` (the server does not modify them) | `200 UserSettings` | `401`, validation `400` |
| 🔒 `POST /users/settings/telegram/connection-code` | — | `200 { code, expiresAt, botLink }`; code is valid for 10 minutes | `401` |
| `POST /users/settings/telegram/verify` | `{ code*: 6 characters, telegramUserId*, username: ≤255, displayName: ≤255 }` | `200 TelegramAccount` | `400 "Invalid or expired code."`, or the Telegram account is already connected to another user |
| 🔒 `DELETE /users/settings/telegram/accounts/{id}` | path: `id` | `204` | `401`, `404` |