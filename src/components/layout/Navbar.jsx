import { Link, useNavigate } from 'react-router-dom'
import { Zap, BookOpen, LayoutTemplate, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2.5 font-semibold text-gray-900">
          <span className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" fill="white" />
          </span>
          Process Agentifier
        </Link>
        <div className="flex items-center gap-1">
          <NavLink href="#" icon={<BookOpen size={14} />}>Documentation</NavLink>
          <NavLink href="#" icon={<LayoutTemplate size={14} />}>Templates</NavLink>
          <NavLink href="#" icon={<ShoppingBag size={14} />}>Marketplace</NavLink>
        </div>
        
        <div className="flex items-center gap-4">
          <h1 className='font-medium text-brand-400 text-base'>
            Welcome aiinhome
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-400 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            
          </button>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, icon, children }) {
  return (
    <a href={href} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600
       hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
      {icon}{children}
    </a>
  )
}
