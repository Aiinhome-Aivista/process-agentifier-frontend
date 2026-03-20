import { Outlet, Navigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../../context/AuthContext'

export default function AppLayout() {
    const { isAuthenticated } = useAuth()


    // Redirect to login if not authenticated and trying to access a protected route
    if (!isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return (
        <div className="min-h-screen">
            <Navbar />

            <main>
                <Outlet />
            </main>
        </div>
    )
}
