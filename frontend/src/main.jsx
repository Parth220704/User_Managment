import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './routes/App.jsx'
import { AuthProvider } from './state/auth.jsx'
import { ThemeProvider } from './state/theme.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
			<ThemeProvider>
				<AuthProvider>
					<App />
					<Toaster position="top-right" />
				</AuthProvider>
			</ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
