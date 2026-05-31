import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ResumeUpload from './pages/ResumeUpload'
import TeamSuggestions from './pages/TeamSuggestions'
import Analytics from './pages/Analytics'
import Projects from './pages/Projects'
import Employees from './pages/Employees'
import MyProfile from './pages/MyProfile'

import Messages from './pages/Messages'
import HRProfile from './pages/HRProfile'
import MyProjects from './pages/MyProjects'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          {/* Employee only */}
          <Route path="profile" element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="employees" element={<ProtectedRoute adminOnly><Employees /></ProtectedRoute>} />
          <Route path="projects" element={<ProtectedRoute adminOnly><Projects /></ProtectedRoute>} />
          <Route path="resumes" element={<ProtectedRoute adminOnly><ResumeUpload /></ProtectedRoute>} />
          <Route path="team" element={<ProtectedRoute adminOnly><TeamSuggestions /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="my-projects" element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
          <Route path="hr-profile" element={<ProtectedRoute adminOnly><HRProfile /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
