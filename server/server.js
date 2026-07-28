const express = require('express');
const app = express();
const port = 3000;
let expenses = []
let loan = null;

app.use(express.json());


app.get('/', (req, res) => {
  res.send("hello world");
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});



app.get('/api/expenses', (req, res) => {
  res.send(expenses);
});

app.post('/api/expenses', (req, res) => {
  const {amount, category, date} = req.body;
  const newExpense = {"id": crypto.randomUUID(), amount, category, date}
  expenses.push(newExpense)
  res.status(201).json(newExpense)
});

app.delete('/api/expenses/:id', (req, res) => {
  const id= req.params.id;
  const before = expenses.length;
  expenses = expenses.filter(e => e.id !==id);
  if (expenses.length === before){
    return res.status(404).json({error: 'not found'});
  } 
  res.sendStatus(204);
    
});

app.get('/api/loan', (req, res) => {
    if (loan === null){
        return res.status(404).send('no loan set');
    }
    res.status(200).send(loan);
})

app.post('/api/loan', (req,res) => {
    const { installments }= req.body;
    loan =  { installments };
    res.status(201).json(loan);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});