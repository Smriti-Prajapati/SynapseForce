import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, BarChart2, Zap, Briefcase, UserCircle, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const adminNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/projects', label: 'Projects', icon: Briefcase },
  { to: '/resumes', label: 'Resumes', icon: FileText },
  { to: '/team', label: 'Team Builder', icon: Search },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
]

const userNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: UserCircle },
]

export default function Sidebar() {
  const { user } = useAuth()
  const navItems = user?.role === 'ADMIN' ? adminNav : userNav

  return (
    <aside className="w-60 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-colors">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">SynapseForce</span>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-10">Workforce Intelligence</p>
      </div>

      {/* Role label */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {user?.role === 'ADMIN' ? 'HR Admin' : 'Employee'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-600/10 text-brand-600 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-600/20 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-semibold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {user?.role === 'ADMIN' ? 'HR Admin' : 'Employee'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
