import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import UserList from './components/UserList'
import AddUser from './components/AddUser'
import Login from './components/Login'
import Register from './components/Register'
import Profile from './components/Profile'
import { useToast } from './components/Toast'

function AppContent() {
  const { user, isAuthenticated, loading, login, register, logout } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  const [currentView, setCurrentView] = useState('users') // 'users' or 'profile'
  const toast = useToast()

  const handleUserAdded = () => {
    // Force refresh UserList by changing key
    setRefreshKey(prev => prev + 1)
  }

  const handleLoginSuccess = (userData, token) => {
    login(userData, token)
    toast.success(`Chào mừng ${userData.name} quay trở lại!`, 'Đăng nhập thành công')
  }

  const handleRegisterSuccess = (userData, token) => {
    // Không login ngay, chỉ hiển thị thông báo và chuyển sang form đăng nhập
    console.log('Register success, showing toast for:', userData.name);
    toast.success(`Tài khoản ${userData.name} đã được tạo thành công! Vui lòng đăng nhập.`, 'Đăng ký thành công')
    // Chuyển sang tab đăng nhập sau 1.5 giây
    setTimeout(() => {
      console.log('Switching to login mode');
      setAuthMode('login')
    }, 1500)
  }

  const handleLogout = () => {
    logout()
    toast.info('Bạn đã đăng xuất khỏi hệ thống', 'Đăng xuất')
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
      <>
        <toast.ToastContainer />
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
      </>
    )
  }

  // Show main app if authenticated
  return (
    <>
      <toast.ToastContainer />
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Quản Lý Người Dùng</h1>
              <p>Hệ thống quản lý danh sách người dùng</p>
            </div>
            <div className="user-info">
              <button 
                onClick={() => setCurrentView('profile')} 
                className="profile-btn"
                title="Xem Profile"
              >
                👤 {user?.name}
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="app-nav">
          <button 
            className={`nav-tab ${currentView === 'users' ? 'active' : ''}`}
            onClick={() => setCurrentView('users')}
          >
            📋 Quản Lý Users
          </button>
          <button 
            className={`nav-tab ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            👤 Thông Tin Cá Nhân
          </button>
        </nav>

        <main className="app-main">
          {currentView === 'users' ? (
            <>
              <div className="main-left">
                <AddUser onUserAdded={handleUserAdded} />
              </div>
              <div className="main-right">
                <UserList key={refreshKey} onUserUpdated={handleUserAdded} />
              </div>
            </>
          ) : (
            <Profile />
          )}
        </main>

        <footer className="app-footer">
          <p>© 2025 Group 16 Project - User Management System</p>
        </footer>
      </div>
    </>
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
