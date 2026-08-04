import { useState } from "react"

function Auth({ onLogin }){
    const[email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mode, setMode] = useState("signup")
    const [error, setError] = useState("")
    const endpoint = mode === 'signup' ? '/api/signup' : '/api/login'
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
        <form>
            {mode === 'signup' ? (<h1>
                Sign up
            </h1>) : (
                <h1>
                    Log in
                </h1>
            )}
            <label htmlFor="email">Email: </label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            <label htmlFor="password">Password: </label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <button type="button" onClick={(e) => submit(e, endpoint)}>submit</button>
            <p>{error}</p>
            {mode === 'signup' ? (
                <p>Already have an account?{' '}
                    <button type="button" onClick={() => {setMode('login'); setError("");}}>Log in</button>
                </p>
            
            ) : (
                <p>Need an account?{' '}
                    <button type="button" onClick={() => {setMode('signup'); setError("");}}>Sign up</button>
                </p>
            )}
        </form>
            
        
    </>
}

export default Auth