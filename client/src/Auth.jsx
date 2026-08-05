import { useState } from "react"

function Auth({ onLogin }){
    const[email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mode, setMode] = useState("signup")
    const [error, setError] = useState("")
    const endpoint = mode === 'signup' ? '/api/signup' : '/api/login'
    const label = mode === 'signup' ? 'Sign up' : 'Log in'
    async function submit(e, endpoint) {
        e.preventDefault()
        if (!email || !password) {
            setError('Enter an email and password')
            return
        }
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'email': email, 'password': password})
        })
        if(!res.ok){
            setError('Login Failed')
            return 
        }
        const data = await res.json()
        
        localStorage.setItem('token', data.token)
        onLogin(data.token)
    }

    return <>
        <div className="auth-container">
            <form className="card">
                <h1>{label}</h1>
                <div className="field">
                    <label className='label' htmlFor="email">Email </label>
                    <input type="email" id="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="field">
                    <label className='label' htmlFor="password">Password </label>
                    <input type="password" id="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <button type="button" className="submit" onClick={(e) => submit(e, endpoint)}>{label}</button>
                {error && <p className="error">{error}</p>}
                {mode === 'signup' ? (
                    <p>Already have an account?{' '}
                        <button type="button" className='toggle-btn' onClick={() => {setMode('login'); setError("");}}>Log in</button>
                    </p>
                ) : (
                    <p>Need an account?{' '}
                        <button type="button" className='toggle-btn' onClick={() => {setMode('signup'); setError("");}}>Sign up</button>
                    </p>
                )}
            </form>
        </div>
        
    </>
}

export default Auth