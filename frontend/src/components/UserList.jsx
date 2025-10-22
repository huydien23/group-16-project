import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserList.css';

function UserList({ onUserUpdated }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/users');
      // Backend trả về { success: true, data: [...] }
      setUsers(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối API.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/users/${id}`);
      setUsers(users.filter(user => user._id !== id));
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Không thể xóa người dùng. Vui lòng thử lại.');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`http://localhost:3000/users/${editingUser._id}`, editForm);
      
      // Cập nhật user trong danh sách
      setUsers(users.map(user => 
        user._id === editingUser._id ? response.data.data : user
      ));
      
      setEditingUser(null);
      setEditForm({ name: '', email: '', phone: '', address: '' });
      
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Không thể cập nhật người dùng. Vui lòng thử lại.');
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', phone: '', address: '' });
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-list-container">
      <h2>Danh Sách Người Dùng</h2>
      
      {/* Form Edit User */}
      {editingUser && (
        <div className="edit-form-container">
          <h3>Chỉnh sửa người dùng</h3>
          <form onSubmit={handleEditSubmit} className="edit-form">
            <div className="form-group">
              <label>Tên *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ</label>
              <textarea
                value={editForm.address}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Lưu</button>
              <button type="button" onClick={handleEditCancel} className="cancel-btn">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <p className="no-users">Chưa có người dùng nào</p>
      ) : (
        <div className="user-grid">
          {users.map((user) => (
            <div key={user._id || user.id} className="user-card">
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <h3>{user.name}</h3>
                <p className="user-email">{user.email}</p>
                {user.phone && <p className="user-phone">📞 {user.phone}</p>}
                {user.address && (
                  <p className="user-address">📍 {user.address}</p>
                )}
              </div>
              <div className="user-actions">
                <button 
                  onClick={() => handleEdit(user)}
                  className="edit-btn"
                >
                  Sửa
                </button>
                <button 
                  onClick={() => handleDelete(user._id || user.id)}
                  className="delete-btn"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;

