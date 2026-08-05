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
    await apiFetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category, date }),
    })
    const getRes = await apiFetch('/api/expenses', {
      method: 'GET'
    })
    const data = await getRes.json()
    setExpenses(data)
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
    <header className="app-header">
      <span className="brand">Fintech Tracker</span>
      <button type="button" className='logout' onClick={ logout }>Log out</button>
    </header>
    <main className="container">
      <section className="card balance">
        <span className='label'>Available to spend</span>
        <span className='amount'>£{available}</span>
        <div className='balance-meta'>
          <span>Weekly Spend: £{weeklySafeToSpend}</span>
          <span>Next Drop: {nextDrop}</span>
        </div>
        
      </section>
      
      <section className='card expenses'>
        <span className='label'>Expenses</span>
        <ul>
          {amountByCategory.map((cat) => (
            
              <li key={cat.category}><div className='category'><span>{cat.category}</span><span className='category-amount'>£{cat.sum}</span></div>
                <ul>
                  {expenses.filter((e) => e.category === cat.category).map((e) => (
                    <li className="expense-row" key={e.id}><div className='expense'><span>{e.date.split('T')[0]}</span><span>£{e.amount}</span> </div><button className='delete' onClick={() => deleteExpense(e.id)} >x</button></li>
                  ))}
                </ul>
              </li>
          ))}
        </ul>
      </section>
      <section className='card'>
        <span className='label'>Add Expense</span>
        <form onSubmit={handleSubmit} className='add-expense'>
          <div className='add-expense-inputs'>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount"></input>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="category"></input>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}></input>
          </div>
          <button type="submit">Add</button>
        </form>
      </section>
    </main>
      
    </>
  )
}

export default App
