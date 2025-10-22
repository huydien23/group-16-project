import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import UserList from './components/UserList'
import AddUser from './components/AddUser'
import Login from './components/Login'
import Register from './components/Register'

function AppContent() {
  const { user, isAuthenticated, loading, login, register, logout } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'

  const handleUserAdded = () => {
    // Force refresh UserList by changing key
    setRefreshKey(prev => prev + 1)
  }

  const handleLoginSuccess = (userData, token) => {
    login(userData, token)
  }

  const handleRegisterSuccess = (userData, token) => {
    register(userData, token)
  }

  const handleLogout = () => {
    logout()
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    )
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="auth-wrapper">
        <div className="auth-header">
          <h1>Hệ Thống Quản Lý Người Dùng</h1>
          <p>Đăng nhập hoặc đăng ký để tiếp tục</p>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => setAuthMode('login')}
          >
            Đăng Nhập
          </button>
          <button 
            className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => setAuthMode('register')}
          >
            Đăng Ký
          </button>
        </div>

        {authMode === 'login' ? (
          <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <Register onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    )
  }

  // Show main app if authenticated
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Quản Lý Người Dùng</h1>
            <p>Hệ thống quản lý danh sách người dùng</p>
          </div>
          <div className="user-info">
            <span className="welcome-text">Xin chào, {user?.name}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="main-left">
          <AddUser onUserAdded={handleUserAdded} />
        </div>
        <div className="main-right">
          <UserList key={refreshKey} onUserUpdated={handleUserAdded} />
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2025 Group 16 Project - User Management System</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
