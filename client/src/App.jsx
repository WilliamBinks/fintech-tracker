import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [available, setAvailable] = useState("")
  const [weeklySafeToSpend, setWeeklySafeToSpend] = useState("")
  const [nextDrop, setNextDrop] = useState("")
  const [expenses, setExpenses] = useState([])
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [amountByCategory, setAmountByCategory] = useState([])
  
  useEffect(() => {
    fetch('/api/expenses')
      .then((res) => res.json())
      .then((data) => setExpenses(data))
     safeToSpend()
     expenseByCategory()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    await addExpense(amount, category, date)
    setAmount("")
    setCategory("")
    setDate("")
  }
  async function addExpense(amount, category, date) {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category, date }),
    })
    const created = await res.json()
    setExpenses((prev) => [created, ...prev])
    expenseByCategory()
    safeToSpend()
  }

  async function deleteExpense(id) {
    const res = await fetch(`/api/expenses/${id}`,{
      method: 'DELETE' })
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      expenseByCategory()
      safeToSpend()
  }

  async function safeToSpend(){
    const res = await fetch('/api/safeToSpend', {
      method: 'GET'
    })
    const data = await res.json();
    setAvailable((data.available).toFixed(2))
    setWeeklySafeToSpend((data.weeklySafeToSpend).toFixed(2))
    setNextDrop(data.nextDrop)
  }

  async function expenseByCategory(){
    const res = await fetch('/api/expenses/totals', {
      method: 'GET'
    })
    const data = await res.json();
    setAmountByCategory(data);
  }

  return (
    <>
      <h1>£{available}</h1>
      <h2>Weekly Spend: £{weeklySafeToSpend}</h2>
      <p>Next Drop: {nextDrop}</p>
      
      <form onSubmit={handleSubmit}>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount"></input>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="category"></input>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}></input>
        <button type="submit">Add</button>
      </form>
      <ul>
        {amountByCategory.map((cat) => (
          <li key={cat.category}><h3>{cat.category} - {cat.sum}</h3>
            <ul>
              {expenses.filter((e) => e.category === cat.category).map((e) => (
                <li key={e.id}>{e.date.split('T')[0]} — {e.category}: {e.amount} <button onClick={() => deleteExpense(e.id)} >x</button></li>
              ))}
            </ul>
          </li>

        ))}
      </ul>
      
      
    </>
  )
}

export default App
