import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const pageTitles = {
  '/': 'Dashboard',
  '/employees': 'Employee Directory',
  '/projects': 'Projects',
  '/resumes': 'Resume Management',
  '/team': 'Team Builder',
  '/analytics': 'Analytics',
  '/messages': 'Messages',
  '/profile': 'My Profile',
  '/hr-profile': 'My Profile',
  '/my-projects': 'My Projects',
}

export default function AppLayout() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'SynapseForce'

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
