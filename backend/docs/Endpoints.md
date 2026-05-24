# BudgetFlow API — Endpoints

Строгий, чистий опис REST API для роботи з авторизацією, профілем користувача та транзакціями.

> Base URL прикладів: `https://your-domain.com`

---

## Зміст

- [Авторизація](#авторизація)
- [Формат помилок](#формат-помилок)
- [Auth](#auth)
  - [POST /auth/login](#post-authlogin)
  - [POST /auth/register](#post-authregister)
- [Home](#home)
  - [GET /home/profile](#get-homeprofile)
- [Transactions](#transactions)
  - [GET /transactions](#get-transactions)
  - [GET /transactions/{id}](#get-transactionsid)
  - [POST /transactions](#post-transactions)
  - [PUT /transactions/{id}](#put-transactionsid)
  - [DELETE /transactions/{id}](#delete-transactionsid)
  - [GET /transactions/grouped](#get-transactionsgrouped)
- [DTO](#dto)
  - [LoginRequestDto](#loginrequestdto)
  - [RegisterRequestDto](#registerrequestdto)
  - [TransactionDto](#transactiondto)
  - [TransactionListDto](#transactionlistdto)
  - [GroupedTransactionDto](#groupedtransactiondto)

---

## Авторизація

Захищені ендпоінти потребують JWT-токен у заголовку:

```http
Authorization: Bearer <token>
```

Токен повертається після успішного входу через `POST /auth/login`.

---

## Формат помилок

API наразі повертає прості текстові повідомлення або порожні відповіді залежно від сценарію.

| HTTP Code | Значення |
|---:|---|
| `400 Bad Request` | Некоректний запит або email вже використовується |
| `401 Unauthorized` | Невалідний email/password або відсутній JWT |
| `404 Not Found` | Ресурс не знайдено або не належить користувачу |
| `204 No Content` | Операція виконана успішно, тіло відповіді відсутнє |

---

# Auth

## POST `/auth/login`

Авторизація користувача та отримання JWT-токена.

### Auth

Не потребує авторизації.

### Request body

```json
{
  "email": "user@example.com",
  "password": "string123"
}
```

### Validation

| Field | Rules |
|---|---|
| `email` | required, email, max length `255` |
| `password` | required, min length `6`, max length `255` |

### Success response

**Status:** `200 OK`

```json
{
  "token": "jwt-token"
}
```

### Error responses

| Status | Body |
|---:|---|
| `401 Unauthorized` | `"Invalid email or password"` |

---

## POST `/auth/register`

Реєстрація нового користувача.

### Auth

Не потребує авторизації.

### Request body

```json
{
  "name": "Serhii",
  "email": "user@example.com",
  "password": "string123"
}
```

### Validation

| Field | Rules |
|---|---|
| `name` | required, max length `100` |
| `email` | required, email, max length `255` |
| `password` | required, min length `6`, max length `255` |

### Success response

**Status:** `200 OK`

```json
{
  "id": 1,
  "name": "Serhii",
  "email": "user@example.com"
}
```

### Error responses

| Status | Body |
|---:|---|
| `400 Bad Request` | `"Email already in use"` |

---

# Home

## GET `/home/profile`

Повертає профіль авторизованого користувача.

> Поточна реалізація: метод ще не реалізований повністю та повертає порожній `200 OK`.

### Auth

Потребує JWT.

```http
Authorization: Bearer <token>
```

### Success response

**Status:** `200 OK`

```json
{}
```

### Error responses

| Status | Description |
|---:|---|
| `401 Unauthorized` | Користувач не авторизований |

---

# Transactions

Усі ендпоінти секції `Transactions` потребують JWT.  
Користувач може працювати лише зі своїми транзакціями.

---

## GET `/transactions`

Повертає список транзакцій поточного користувача.

### Auth

Потребує JWT.

### Success response

**Status:** `200 OK`

```json
[
  {
    "id": 1,
    "counterparty": "Coffee Shop",
    "title": "Morning coffee",
    "description": "Latte",
    "details": "",
    "amount": 4.50,
    "currency": "USD",
    "date": "2026-05-24T10:30:00",
    "userName": "Serhii",
    "userId": 1,
    "type": "Expense"
  }
]
```

### Error responses

| Status | Description |
|---:|---|
| `401 Unauthorized` | Користувач не авторизований |

---

## GET `/transactions/{id}`

Повертає деталі конкретної транзакції поточного користувача.

### Auth

Потребує JWT.

### Path parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `id` | `int` | yes | ID транзакції |

### Success response

**Status:** `200 OK`

```json
{
  "id": 1,
  "counterparty": "Coffee Shop",
  "title": "Morning coffee",
  "description": "Latte",
  "details": "",
  "amount": 4.50,
  "currency": "USD",
  "date": "2026-05-24T10:30:00",
  "userName": "Serhii",
  "userId": 1,
  "type": "Expense"
}
```

### Error responses

| Status | Description |
|---:|---|
| `401 Unauthorized` | Користувач не авторизований |
| `404 Not Found` | Транзакцію не знайдено або вона не належить користувачу |

---

## POST `/transactions`

Створює нову транзакцію для поточного користувача.

### Auth

Потребує JWT.

### Request body

```json
{
  "id": 0,
  "counterparty": "Coffee Shop",
  "title": "Morning coffee",
  "description": "Latte",
  "details": "",
  "amount": 4.50,
  "currency": "USD",
  "date": "2026-05-24T10:30:00",
  "userName": "",
  "userId": 0,
  "type": "Expense"
}
```

### Validation

| Field | Rules |
|---|---|
| `id` | required |
| `counterparty` | max length `255` |
| `title` | max length `255` |
| `amount` | required, range `0.01` — `double.MaxValue` |
| `currency` | required, max length `5` |
| `date` | required |
| `userName` | max length `100` |
| `type` | required |

### Success response

**Status:** `201 Created`

Header `Location` вказує на створений ресурс:

```http
Location: /transactions/1
```

Body:

```json
{
  "id": 1,
  "counterparty": "Coffee Shop",
  "title": "Morning coffee",
  "description": "Latte",
  "details": "",
  "amount": 4.50,
  "currency": "USD",
  "date": "2026-05-24T10:30:00",
  "userName": "Serhii",
  "userId": 1,
  "type": "Expense"
}
```

### Error responses

| Status | Description |
|---:|---|
| `400 Bad Request` | Некоректне тіло запиту або помилка валідації |
| `401 Unauthorized` | Користувач не авторизований |

---

## PUT `/transactions/{id}`

Оновлює існуючу транзакцію поточного користувача.

### Auth

Потребує JWT.

### Path parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `id` | `int` | yes | ID транзакції |

### Request body

```json
{
  "id": 1,
  "counterparty": "Updated Shop",
  "title": "Updated title",
  "description": "Updated description",
  "details": "",
  "amount": 10.00,
  "currency": "USD",
  "date": "2026-05-24T12:00:00",
  "userName": "",
  "userId": 0,
  "type": "Expense"
}
```

### Updated fields

| Field |
|---|
| `counterparty` |
| `title` |
| `description` |
| `amount` |
| `currency` |
| `date` |
| `type` |

> `details`, `userName` та `userId` присутні у DTO, але в поточній реалізації методу `PUT` напряму не оновлюються.

### Success response

**Status:** `200 OK`

```json
{
  "id": 1,
  "counterparty": "Updated Shop",
  "title": "Updated title",
  "description": "Updated description",
  "details": "",
  "amount": 10.00,
  "currency": "USD",
  "date": "2026-05-24T12:00:00",
  "userName": "Serhii",
  "userId": 1,
  "type": "Expense"
}
```

### Error responses

| Status | Description |
|---:|---|
| `400 Bad Request` | Некоректне тіло запиту або помилка валідації |
| `401 Unauthorized` | Користувач не авторизований |
| `404 Not Found` | Транзакцію не знайдено або вона не належить користувачу |

---

## DELETE `/transactions/{id}`

Видаляє транзакцію поточного користувача.

### Auth

Потребує JWT.

### Path parameters

| Parameter | Type | Required | Description |
|---|---|---:|---|
| `id` | `int` | yes | ID транзакції |

### Success response

**Status:** `204 No Content`

Response body відсутній.

### Error responses

| Status | Description |
|---:|---|
| `401 Unauthorized` | Користувач не авторизований |
| `404 Not Found` | Транзакцію не знайдено або вона не належить користувачу |

---

## GET `/transactions/grouped`

Повертає згруповані транзакції поточного користувача.

### Auth

Потребує JWT.

### Success response

**Status:** `200 OK`

```json
[
  {
    "id": "2026-05-24",
    "date": "2026-05-24",
    "places": [
      {
        "id": 1,
        "name": "Coffee Shop",
        "amount": 4.50,
        "details": "Morning coffee",
        "notes": "Latte"
      }
    ]
  }
]
```

### Response fields

| Field | Type | Description |
|---|---|---|
| `id` | `string` | ID групи |
| `date` | `string` | Дата групи |
| `places` | `GroupedPlaceDto[]` | Список місць / операцій у межах групи |

### Error responses

| Status | Description |
|---:|---|
| `401 Unauthorized` | Користувач не авторизований |

---

# DTO

## LoginRequestDto

| Field | Type | Required | Rules |
|---|---|---:|---|
| `email` | `string` | yes | email, max length `255` |
| `password` | `string` | yes | min length `6`, max length `255` |

---

## RegisterRequestDto

| Field | Type | Required | Rules |
|---|---|---:|---|
| `name` | `string` | yes | max length `100` |
| `email` | `string` | yes | email, max length `255` |
| `password` | `string` | yes | min length `6`, max length `255` |

---

## TransactionDto

| Field | Type | Required | Rules / Default |
|---|---|---:|---|
| `id` | `int` | yes | — |
| `counterparty` | `string` | no | max length `255`, default `""` |
| `title` | `string` | no | max length `255`, default `""` |
| `description` | `string` | no | default `""` |
| `details` | `string` | no | default `""` |
| `amount` | `decimal` | yes | min `0.01` |
| `currency` | `string` | yes | max length `5`, default `"USD"` |
| `date` | `DateTime` | yes | ISO 8601 recommended |
| `userName` | `string` | no | max length `100`, default `""` |
| `userId` | `int` | no | — |
| `type` | `TransactionType` | yes | enum |

---

## TransactionListDto

| Field | Type | Required | Rules / Default |
|---|---|---:|---|
| `counterparty` | `string` | no | max length `255`, default `""` |
| `title` | `string` | no | max length `255`, default `""` |
| `amount` | `decimal` | yes | min `0.01` |
| `currency` | `string` | yes | max length `5` |
| `type` | `TransactionType` | yes | enum |
| `date` | `DateTime` | yes | ISO 8601 recommended |

---

## GroupedTransactionDto

| Field | Type | Description |
|---|---|---|
| `id` | `string` | ID групи |
| `date` | `string` | Дата групи |
| `places` | `GroupedPlaceDto[]` | Згруповані записи |

### GroupedPlaceDto

| Field | Type | Description |
|---|---|---|
| `id` | `int` | ID запису |
| `name` | `string` | Назва місця / контрагента |
| `amount` | `decimal` | Сума |
| `details` | `string` | Деталі |
| `notes` | `string` | Нотатки |

---

# Notes

- `GET /home/profile` поки має TODO-реалізацію.
- `TransactionType` використовується як enum, але його значення не наведені у фрагменті коду.
- Для захищених ендпоінтів `userId` береться з JWT claims через `ClaimsPrincipalExtensions.GetUserId(User)`.
- У `PUT /transactions/{id}` поле `details` не оновлюється напряму, хоча є в `TransactionDto`.
