# Fintech Tracker API

REST API for tracking expenses and loan instalments.
**Backed by PostgreSQL** — data persists across server restarts.

**Base URL:** `http://localhost:3000`

All request/response bodies are JSON. Send `Content-Type: application/json` on requests with a body.

> **Note on numbers:** money columns are stored as SQL `NUMERIC`, which the
> `pg` driver returns as **strings** (e.g. `"9.99"`) to preserve precision.
> Parse them client-side if you need to do maths. `date` columns are returned
> as ISO datetime strings.

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
{ "id": "6dcdf6e1-d1d4-42ee-8237-c47bc30c7190", "amount": "9.99", "category": "coffee", "date": "2026-07-29T00:00:00.000Z" }
```

`id` is a database-generated UUID (`gen_random_uuid()`).

### `GET /api/expenses`

List all expenses, most recent first.

**Response** `200 OK`

```json
[
  { "id": "6dcdf6e1-d1d4-42ee-8237-c47bc30c7190", "amount": "9.99", "category": "coffee", "date": "2026-07-29T00:00:00.000Z" }
]
```

Returns `[]` when there are no expenses.

### `POST /api/expenses`

Create an expense. The database assigns the `id`.

**Request**

```json
{ "amount": 9.99, "category": "coffee", "date": "2026-07-29" }
```

**Response** `201 Created`

```json
{ "id": "6dcdf6e1-d1d4-42ee-8237-c47bc30c7190", "amount": "9.99", "category": "coffee", "date": "2026-07-29T00:00:00.000Z" }
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

A single loan record: a `balance` plus an instalment schedule. Posting again
replaces the existing record (it does not append).

```json
{ "id": "46b09add-f818-4b5b-aea3-529c3139e4e3", "balance": "6000.00", "installments": [ { "date": "2026-09-01", "amount": 3000 } ] }
```

`installments` is stored as a `JSONB` column.

### `GET /api/loan`

Read the current loan record.

**Response** `200 OK`

```json
{ "id": "46b09add-f818-4b5b-aea3-529c3139e4e3", "balance": "6000.00", "installments": [ { "date": "2026-09-01", "amount": 3000 } ] }
```

Returns `null` when no loan has been set.

### `POST /api/loan`

Set or replace the loan record.

**Request**

```json
{ "balance": 6000, "installments": [ { "date": "2026-09-01", "amount": 3000 }, { "date": "2026-01-10", "amount": 3000 } ] }
```

**Response** `201 Created`

```json
{ "id": "46b09add-f818-4b5b-aea3-529c3139e4e3", "balance": "6000.00", "installments": [ { "date": "2026-09-01", "amount": 3000 }, { "date": "2026-01-10", "amount": 3000 } ] }
```

---

## Running locally

### 1. Prerequisites — PostgreSQL

Install and start Postgres (macOS / Homebrew):

```bash
brew install postgresql@16
brew services start postgresql@16
```

### 2. Create the database + tables

```bash
createdb tracker
psql tracker
```

```sql
CREATE TABLE expenses (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount   NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  date     DATE NOT NULL
);

CREATE TABLE loan (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  balance      NUMERIC(10,2) NOT NULL,
  installments JSONB NOT NULL DEFAULT '[]'
);
```

### 3. Configure the connection

Create `server/.env` (this file is gitignored — never commit credentials):

```
DATABASE_URL=postgres://<user>@localhost:5432/tracker
```

### 4. Run

```bash
cd server
npm install
npm run dev     # nodemon + --env-file=.env, auto-restarts on change
# or: npm start
```

Server listens on port `3000`. The `--env-file=.env` flag is required — running
`node server.js` directly will fail to find `DATABASE_URL`.
```
