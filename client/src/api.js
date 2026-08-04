export function apiFetch(url, options = {}){
    const token = localStorage.getItem('token');
    const res = fetch(url, {
    ...options,
    headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    }})
    return res
}

