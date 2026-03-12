import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChatInterface } from './components/ChatInterface'
import './index.css'

// O React vai procurar uma div com id="root" no seu index.html
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ChatInterface />
    </React.StrictMode>,
  )
}
