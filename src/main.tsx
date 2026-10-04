import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { EmailProvider } from './state/EmailContext'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <EmailProvider>
        <App />
      </EmailProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
