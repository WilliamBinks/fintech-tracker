import { useEffect, useState } from 'react'
import './App.css'
import { apiFetch } from './api'
import Auth from './Auth'

function App() {
  const [available, setAvailable] = useState("")
  const [weeklySafeToSpend, setWeeklySafeToSpend] = useState("")
  const [nextDrop, setNextDrop] = useState("")
  const [expenses, setExpenses] = useState([])
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState("")
  const [amountByCategory, setAmountByCategory] = useState([])
  const [token, setToken] = useState(localStorage.getItem('token'))

  
  
  useEffect(() => {
    if (!token) return 
    
    apiFetch('/api/expenses')
      .then((res) => res.json())
      .then((data) => setExpenses(data))
     safeToSpend()
     expenseByCategory()
  }, [token])
  if (!token) {
    return <Auth onLogin = {setToken} />
  } 

  async function handleSubmit(e) {
    e.preventDefault()
    await addExpense(amount, category, date)
    setAmount("")
    setCategory("")
    setDate("")
  }
  async function addExpense(amount, category, date) {
    const res = await apiFetch('/api/expenses', {
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
    const res = await apiFetch(`/api/expenses/${id}`,{
      method: 'DELETE' })
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      expenseByCategory()
      safeToSpend()
  }

  async function safeToSpend(){
    const res = await apiFetch('/api/safeToSpend', {
      method: 'GET'
    })
    const data = await res.json();
    setAvailable((data.available).toFixed(2))
    setWeeklySafeToSpend((data.weeklySafeToSpend).toFixed(2))
    setNextDrop(data.nextDrop)
  }

  async function expenseByCategory(){
    const res = await apiFetch('/api/expenses/totals', {
      method: 'GET'
    })
    const data = await res.json();
    setAmountByCategory(data);
  }

  function logout(){
    localStorage.removeItem('token');
    setToken(null)
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
      <button type="button" onClick={ logout }>Log out</button>
      
    </>
  )
}

export default App
