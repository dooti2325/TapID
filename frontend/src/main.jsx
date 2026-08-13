import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import './styles/main.css'
import axios from 'axios'

import { AuthProvider } from './context/AuthContext'

// Set global base URL for API requests. In production (Vercel), 
// this will point to the Render backend url via the VITE_API_URL environment variable.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
