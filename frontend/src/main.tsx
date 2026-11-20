import '@fontsource-variable/inter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App'
import { ToastProvider } from '@/components/ui/Toast'
import '@/styles/index.css'

const container = document.getElementById('root')

if (!container) {
  // Fail loudly: a missing root element means index.html and main.tsx disagree.
  throw new Error('Root element #root was not found in index.html')
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
