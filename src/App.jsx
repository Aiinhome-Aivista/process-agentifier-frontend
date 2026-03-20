
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import { AuthProvider } from './context/AuthContext'

function Layout() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/'

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Navbar />}

      <main>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/analysis/:id" element={<AnalysisPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route
            path="/connect-erp"
            element={
              <div className="max-w-xl mx-auto px-6 py-20 text-center text-white/40">
                ERP connection coming soon.
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/agentforcex">
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  )
}