import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Stripe (and some backends) can redirect to `//path` when concatenating origin + path. React Router
// won't match routes against a pathname that starts with `//`, so normalize once on boot.
if (typeof window !== 'undefined') {
    const { pathname, search, hash } = window.location
    if (pathname.startsWith('//')) {
        const fixed = pathname.replace(/^\/+/, '/')
        window.history.replaceState(null, '', `${fixed}${search}${hash}`)
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
