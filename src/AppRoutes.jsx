import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Applayout from './components/layout/Applayout'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import SuggestionDetailsPage from './pages/SuggestionDetailsPage'

// PrivateRoute: Redirect to login if not authenticated
const PrivateRoute = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />
}

// PublicRoute: Redirect to home if already authenticated
const PublicRoute = () => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/home" replace /> : <Outlet />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LoginPage />} />
      </Route>

      {/* Private Routes (Wrapped in PrivateRoute and AppLayout) */}
      <Route element={<PrivateRoute />}>
        <Route element={<Applayout />}>
          <Route path="/suggestion/:id" element={<SuggestionDetailsPage />} />
          <Route path="/home" element={<HomePage />} />
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
          {/* Catch-all: Redirect to home or another page */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
