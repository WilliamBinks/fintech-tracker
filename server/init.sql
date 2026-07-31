CREATE TABLE expenses(
    id SERIAL PRIMARY KEY,
    amount NUMERIC(12,2),
    category TEXT,
    date DATE
);

CREATE TABLE loan (
    id SERIAL PRIMARY KEY,
    balance NUMERIC(12,2),
    installments JSONB
);