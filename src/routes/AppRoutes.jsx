import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import AnalysisPage from '../pages/AnalysisPage'
import HistoryPage from '../pages/HistoryPage'
import LoginPage from '../pages/LoginPage'
import AppLayout from '../components/layout/Applayout'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<AppLayout />}>
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
      </Route>
    </Routes>
  )
}
