import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import UserList from './components/UserList'
import AddUser from './components/AddUser'
import Login from './components/Login'
import Register from './components/Register'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import Profile from './components/Profile'
import { useToast } from './components/Toast'

function ResetPasswordPage() {
  const navigate = useNavigate();
  
  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <h1>Hệ Thống Quản Lý Người Dùng</h1>
        <p>Đặt lại mật khẩu mới</p>
      </div>
      <ResetPassword 
        onBackToLogin={() => navigate('/')}
      />
    </div>
  );
}

function AppContent() {
  const { user, isAuthenticated, loading, login, logout } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const [authMode, setAuthMode] = useState('login') // 'login', 'register', 'forgot-password'
  // Set default view based on user role: admin -> 'users', user -> 'profile'
  const [currentView, setCurrentView] = useState('dashboard')
  const toast = useToast()

  // Update current view based on user role when user changes
  useEffect(() => {
    if (user) {
      // Default to dashboard for all users
      setCurrentView('dashboard')
    }
  }, [user])

  const handleUserAdded = () => {
    // Force refresh UserList by changing key
    setRefreshKey(prev => prev + 1)
  }

  const handleLoginSuccess = (userData, token) => {
    login(userData, token)
    toast.success(`Chào mừng ${userData.name} quay trở lại!`, 'Đăng nhập thành công')
  }

  const handleRegisterSuccess = (userData) => {
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
    // Forgot Password & Reset Password use auth-wrapper
    if (authMode === 'forgot-password') {
      return (
        <>
          <toast.ToastContainer />
          <div className="auth-wrapper">
            <div className="auth-header">
              <h1>Hệ Thống Quản Lý Người Dùng</h1>
              <p>Khôi phục mật khẩu của bạn</p>
            </div>
            <ForgotPassword 
              onBackToLogin={() => setAuthMode('login')}
              onSuccess={(email) => {
                toast.success(`Email khôi phục đã được gửi đến ${email}`, 'Thành công')
              }}
            />
          </div>
        </>
      )
    }

    if (authMode === 'reset-password') {
      return (
        <>
          <toast.ToastContainer />
          <div className="auth-wrapper">
            <div className="auth-header">
              <h1>Hệ Thống Quản Lý Người Dùng</h1>
              <p>Đặt lại mật khẩu mới</p>
            </div>
            <ResetPassword 
              onBackToLogin={() => setAuthMode('login')}
              onSuccess={() => {
                toast.success('Mật khẩu đã được đặt lại thành công!', 'Thành công')
              }}
            />
          </div>
        </>
      )
    }

    // Login & Register with tabs
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
            <Login 
              onLoginSuccess={handleLoginSuccess} 
              onSwitchToRegister={() => setAuthMode('register')}
              onForgotPassword={() => setAuthMode('forgot-password')}
            />
          ) : (
            <Register 
              onRegisterSuccess={handleRegisterSuccess} 
              onSwitchToLogin={() => setAuthMode('login')} 
            />
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
          <div className="header-wrapper">
            <div className="header-content">
              <div className="header-left">
                <div className="header-info">
                  <h1>Quản Lý Người Dùng</h1>
                  <p>Hệ thống quản lý danh sách người dùng</p>
                </div>

                {/* Navigation Tabs - Nằm cạnh logo */}
                <nav className="app-nav-header">
                  <button 
                    className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setCurrentView('dashboard')}
                  >
                    Dashboard
                  </button>
                  {/* Chỉ admin mới thấy tab Quản Lý Users */}
                  {user?.role === 'admin' && (
                    <button 
                      className={`nav-tab ${currentView === 'users' ? 'active' : ''}`}
                      onClick={() => setCurrentView('users')}
                    >
                      Quản Lý Users
                    </button>
                  )}
                  <button 
                    className={`nav-tab ${currentView === 'profile' ? 'active' : ''}`}
                    onClick={() => setCurrentView('profile')}
                  >
                    Thông Tin Cá Nhân
                  </button>
                </nav>
              </div>
            </div>

            <div className="user-info">
              {/* Tên User */}
              <div className="user-name-wrapper">
                <span className="user-greeting">
                  Xin chào, {user?.name?.split(' ').slice(1).join(' ')}
                </span>
              </div>

              {/* Badge Admin/User */}
              <div className="user-badge-wrapper">
                <span className={`role-tag ${user?.role === 'admin' ? 'admin' : 'user'}`}>
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
              </div>

              {/* Nút Đăng Xuất */}
              <div className="logout-wrapper">
                <button onClick={handleLogout} className="logout-btn">
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className={currentView === 'profile' || currentView === 'dashboard' ? 'app-main app-main-single' : 'app-main'}>
          {currentView === 'dashboard' ? (
            <div className="dashboard-container">
              <div className="dashboard-welcome">
                <div className="welcome-header">
                  <div className="welcome-icon">👋</div>
                  <div className="welcome-content">
                    <h2>Xin chào, {user?.name?.split(' ').slice(1).join(' ')}!</h2>
                    <p>Chào mừng bạn trở lại với hệ thống quản lý</p>
                  </div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div 
                  className="info-card profile-card clickable-card"
                  onClick={() => setCurrentView('profile')}
                  title="Click để xem chi tiết"
                >
                  <div className="card-icon">👤</div>
                  <h3>Thông Tin Cá Nhân</h3>
                  <div className="card-details">
                    <div className="detail-row">
                      <span className="detail-label">Họ tên:</span>
                      <span className="detail-value">{user?.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{user?.email}</span>
                    </div>
                    <div className="detail-row detail-row-highlight">
                      <span className="detail-label">Vai trò:</span>
                      <span className={`role-badge ${user?.role}`}>
                        {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </div>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="info-card admin-card">
                    <div className="card-icon">⚙️</div>
                    <h3>Quản Lý Hệ Thống</h3>
                    <div className="card-details">
                      <p className="admin-text">Bạn có toàn quyền quản lý người dùng trong hệ thống</p>
                      <button 
                        className="quick-action-btn"
                        onClick={() => setCurrentView('users')}
                      >
                        📋 Xem Danh Sách Users
                      </button>
                    </div>
                  </div>
                )}

                <div className="info-card activity-card">
                  <div className="card-icon">📊</div>
                  <h3>Hoạt Động</h3>
                  <div className="card-details">
                    <div className="activity-item">
                      <span className="activity-dot"></span>
                      <span>Đăng nhập lần cuối: Hôm nay</span>
                    </div>
                    <div className="activity-item">
                      <span className="activity-dot"></span>
                      <span>Trạng thái: Đang hoạt động</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : currentView === 'users' && user?.role === 'admin' ? (
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
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
