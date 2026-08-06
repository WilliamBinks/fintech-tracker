const { Pool } = require('pg');
const { SafeToSpend } = require('./safetospend.js');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const express = require('express');
const app = express();
const port = process.env.PORT || 3000; 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(express.json());


function auth(req,res,next) {
  const header = req.headers.authorization;
  if (!header){
    return res.status(401).json("Unauthorised");
  }
  const token = header.split(' ')[1];
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = decoded.userID;
    next();
  } catch {
    return res.status(401).json("Unauthorised");
  }
  
  
}

app.get('/', (req, res) => {
  res.send("hello world");
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});



app.get('/api/expenses', auth, async (req, res) => {
  const result = await pool.query("SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC", [req.userID]);
  res.json(result.rows);
});

app.post('/api/expenses', auth, async (req, res) => {
  const {amount, category, date} = req.body;
  const result = await pool.query("INSERT INTO expenses (amount, category, date, user_id) VALUES ($1, $2, $3, $4) RETURNING *",[amount, category, date, req.userID]);
  res.status(201).json(result.rows[0])
});

app.delete('/api/expenses/:id', auth, async (req, res) => {
  const id= req.params.id;
  const result = await pool.query("DELETE FROM expenses where id = $1 AND user_id = $2 RETURNING *",[id, req.userID]);
  if (result.rowCount === 0){
    return res.status(404).json({error: 'not found'});
  } 
  res.sendStatus(204);
    
});

app.get('/api/loan', auth, async (req, res) => {
    const result = await pool.query("SELECT * FROM loan WHERE user_id = $1", [req.userID]);
    res.json(result.rows[0] ?? null);
})

app.post('/api/loan', auth, async (req,res) => {
    const { balance,installments }= req.body;
    const deletion = await pool.query("DELETE FROM loan where user_id = $1", [req.userID]);
    const result = await pool.query("INSERT INTO loan (balance, installments, user_id) VALUES ($1, $2, $3) RETURNING *",[balance, JSON.stringify(installments), req.userID]);
    res.status(201).json(result.rows[0]);
})

app.get('/api/safeToSpend', auth, async (req,res) => {
  const loan = await pool.query("SELECT * FROM loan WHERE user_id = $1",[req.userID]);
  const expenses = await pool.query("SELECT * FROM expenses WHERE user_id = $1",[req.userID]);
  res.json(SafeToSpend(loan.rows[0], expenses.rows, new Date().toISOString().split('T')[0]))
})

app.get('/api/expenses/totals', auth, async (req,res) => {
  const result = await pool.query("SELECT sum(amount), category FROM expenses WHERE user_id = $1 GROUP BY category",[req.userID]);
  console.log(result.rows);
  res.json(result.rows);
});

app.post('/api/signup', async (req,res) => {
  const {email, password} = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const result = await pool.query("INSERT INTO users (email,password_hash) VALUES ($1,$2) RETURNING id",[email, password_hash])
  const token = jwt.sign({userID: result.rows[0].id}, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token });
});

app.post('/api/login', async (req,res) => {
  const {email, password} = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email=$1",[email]);
  const user = result.rows[0];
  if(!user){
    return res.status(401).json("Enter Valid Credentials");
  }

  const passwordCompare = await bcrypt.compare(password, result.rows[0].password_hash);
  if (!passwordCompare){
    return res.status(401).json("Enter Valid Credentials!");
  } else {
    const token = jwt.sign({userID: user.id}, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  }
});

module.exports = { app, pool };

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}