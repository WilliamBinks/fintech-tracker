# Fintech Tracker API

In-memory REST API for tracking expenses and loan instalments.
Data is held in memory and resets when the server restarts (Postgres swap planned).

**Base URL:** `http://localhost:3000`

All request/response bodies are JSON. Send `Content-Type: application/json` on requests with a body.

---

## Health

### `GET /api/health`

Liveness check.

**Response** `200 OK`

```json
{ "status": "ok", "uptime": 6.45 }
```

---

## Expenses

An expense has the shape:

```json
{ "id": "b0cfae7e-203f-44b8-9082-e02a6176dc91", "amount": 9.99, "category": "coffee", "date": "2026-07-28" }
```

`id` is a server-generated UUID. `amount` is a number, `category` and `date` are strings.

### `GET /api/expenses`

List all expenses.

**Response** `200 OK`

```json
[
  { "id": "b0cfae7e-203f-44b8-9082-e02a6176dc91", "amount": 9.99, "category": "coffee", "date": "2026-07-28" }
]
```

Returns `[]` when there are no expenses.

### `POST /api/expenses`

Create an expense. The server assigns the `id`.

**Request**

```json
{ "amount": 9.99, "category": "coffee", "date": "2026-07-28" }
```

**Response** `201 Created`

```json
{ "id": "b0cfae7e-203f-44b8-9082-e02a6176dc91", "amount": 9.99, "category": "coffee", "date": "2026-07-28" }
```

### `DELETE /api/expenses/:id`

Delete an expense by its `id`.

**Response** `204 No Content` — deleted successfully (empty body).

**Response** `404 Not Found` — no expense with that `id`.

```json
{ "error": "not found" }
```

---

## Loan

A single loan record holding the instalment schedule. Setting it again replaces the
previous record (it does not append).

```json
{ "installments": [ { "date": "2026-09-01", "amount": 3000 } ] }
```

### `GET /api/loan`

Read the current loan record.

**Response** `200 OK`

```json
{ "installments": [ { "date": "2026-09-01", "amount": 3000 }, { "date": "2026-01-10", "amount": 3000 } ] }
```

### `POST /api/loan`

Set or update the loan's instalment schedule. Replaces any existing record.

**Request**

```json
{ "installments": [ { "date": "2026-09-01", "amount": 3000 }, { "date": "2026-01-10", "amount": 3000 } ] }
```

**Response** `201 Created`

```json
{ "installments": [ { "date": "2026-09-01", "amount": 3000 }, { "date": "2026-01-10", "amount": 3000 } ] }
```

---

## Running locally

```bash
cd server
npm install
npm run dev    # nodemon, auto-restarts on change
# or: npm start
```

Server listens on port `3000`.
