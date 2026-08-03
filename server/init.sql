CREATE TABLE IF NOT EXISTS expenses(
    id SERIAL PRIMARY KEY,
    amount NUMERIC(12,2),
    category TEXT,
    date DATE
);

CREATE TABLE IF NOT EXISTS loan (
    id SERIAL PRIMARY KEY,
    balance NUMERIC(12,2),
    installments JSONB
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);