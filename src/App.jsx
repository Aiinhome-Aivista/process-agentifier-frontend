import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/agentforcex">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}