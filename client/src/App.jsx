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
  const [paid, setPaid] = useState(false)
  const [installments, setInstallments] = useState([{date:"", amount:""}, {date:"", amount:""}, {date:"", amount:""}])
  const[bufferPercentage, setBufferPercentage] = useState(10)
  
  useEffect(() => {
    if (!token) return 
    
    apiFetch('/api/expenses')
      .then((res) => res.json())
      .then((data) => setExpenses(data))
     safeToSpend()
     expenseByCategory()
     hasUserPaid()
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

  async function hasUserPaid() {
    const res = await apiFetch('/api/paid', {
      method:'GET'
    })
    const data = await res.json()
    console.log(data.paid);
    setPaid(data.paid);
    
  }
  async function handleUpgrade(){
    const res = await apiFetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'term' })
    })
    const { url } = await res.json();
    window.location = url
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

  async function updateInstallment(index,field,value){
    setInstallments(prev => prev.map((row,i) => i === index ? {...row, [field]: value} : row))
  }

  async function handleInstallments(e){
    e.preventDefault();
    const res = await apiFetch('/api/loan',{
      method: 'POST',
      headers:{'Content-Type': 'application/json'},
      body: JSON.stringify({ balance: 0, installments: installments})
    })
    safeToSpend();
  }

  function logout(){
    localStorage.removeItem('token');
    setToken(null)
  }

  return (
    <>
    
    <header className="app-header">
      <span className="brand">Fintech Tracker</span>
      <div className='nav-buttons'>
        {!paid && <button type="button" onClick={handleUpgrade}>Upgrade</button>}
        <button type="button" className='logout' onClick={ logout }>Log out</button>
      </div>
    </header>
    <main className="container">
      <section className="card balance">
        <span className='label'>Available to spend</span>
        <span className='amount'>£{available}</span>
        <div className='balance-meta'>
          <span>Weekly Spend: £{(weeklySafeToSpend * (1 - bufferPercentage/100)).toFixed(2)}</span>
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

      <section className='card'>
        <span className='label'>Add Loan Installments</span>
        <form onSubmit={handleInstallments}>
          <div>
            <input type="date" value={installments[0].date} onChange={(e) => updateInstallment(0, 'date', e.target.value)}></input><input type="number" value={installments[0].amount} onChange={(e) => updateInstallment(0, 'amount', e.target.value)}></input>
            <input type="date" value={installments[1].date} onChange={(e) => updateInstallment(1, 'date', e.target.value)}></input><input type="number" value={installments[1].amount} onChange={(e) => updateInstallment(1, 'amount', e.target.value)}></input>
            <input type="date" value={installments[2].date} onChange={(e) => updateInstallment(2, 'date', e.target.value)}></input><input type="number" value={installments[2].amount} onChange={(e) => updateInstallment(2, 'amount', e.target.value)}></input>
          </div>
          <button type="submit">Add</button>
        </form>
      </section>

      <section className='card'>
        <span className='label'>Safe to Spend Buffer</span>
          <input type="number" min="0" max="100" value={bufferPercentage} onChange={(e) => setBufferPercentage(e.target.value)}></input>
      </section>
    </main>
      
    </>
  )
}

export default App
