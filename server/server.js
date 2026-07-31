const { Pool } = require('pg');
const { SafeToSpend } = require('./safetospend.js');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());


app.get('/', (req, res) => {
  res.send("hello world");
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});



app.get('/api/expenses', async (req, res) => {
  const result = await pool.query("SELECT * FROM expenses ORDER BY date DESC");
  res.json(result.rows);
});

app.post('/api/expenses', async (req, res) => {
  const {amount, category, date} = req.body;
  const result = await pool.query("INSERT INTO expenses (amount, category, date) VALUES ($1, $2, $3) RETURNING *",[amount, category, date]);
  res.status(201).json(result.rows[0])
});

app.delete('/api/expenses/:id', async (req, res) => {
  const id= req.params.id;
  const result = await pool.query("DELETE FROM expenses where id = $1 RETURNING *",[id]);
  if (result.rowCount === 0){
    return res.status(404).json({error: 'not found'});
  } 
  res.sendStatus(204);
    
});

app.get('/api/loan', async (req, res) => {
    const result = await pool.query("SELECT * FROM loan");
    res.json(result.rows[0] ?? null);
})

app.post('/api/loan', async (req,res) => {
    const { balance,installments }= req.body;
    const deletion = await pool.query("DELETE FROM loan");
    const result = await pool.query("INSERT INTO loan (balance, installments) VALUES ($1, $2) RETURNING *",[balance, JSON.stringify(installments)]);
    res.status(201).json(result.rows[0]);
})

app.get('/api/safeToSpend', async (req,res) => {
  const loan = await pool.query("SELECT * FROM loan");
  const expenses = await pool.query("SELECT * FROM expenses");
  res.json(SafeToSpend(loan.rows[0], expenses.rows, new Date().toISOString().split('T')[0]))
})

app.get('/api/expenses/totals', async (req,res) => {
  const result = await pool.query("SELECT sum(amount), category FROM expenses GROUP BY category");
  console.log(result.rows);
  res.json(result.rows);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});