import { useState } from 'react'
import './App.css'
import UserList from './components/UserList'
import AddUser from './components/AddUser'

function App() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUserAdded = () => {
    // Force refresh UserList by changing key
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Quản Lý Người Dùng</h1>
        <p>Hệ thống quản lý danh sách người dùng</p>
        <p> Duy Test </p>
        <p>Test xung đột</p>

      </header>

      <main className="app-main">
        <div className="main-left">
          <AddUser onUserAdded={handleUserAdded} />
        </div>
        <div className="main-right">
          <UserList key={refreshKey} />
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2025 Group 16 Project - User Management System</p>
      </footer>
    </div>
  )
}

export default App
