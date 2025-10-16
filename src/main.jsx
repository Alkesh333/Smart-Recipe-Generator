import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ Import the Toaster from Sonner
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* ✅ Add Toaster to make toast notifications work globally */}
    <Toaster richColors position="top-right" />
  </StrictMode>,
)
