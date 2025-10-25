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
  const [editValidationErrors, setEditValidationErrors] = useState({});
  
  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const handleDeleteClick = (user) => {
    setDeleteModal({ show: true, user });
  };

  const handleDeleteConfirm = async () => {
    const id = deleteModal.user._id || deleteModal.user.id;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(users.filter(user => user._id !== id));
      setDeleteModal({ show: false, user: null });
      if (onUserUpdated) {
        onUserUpdated();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Không thể xóa người dùng. Vui lòng thử lại.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, user: null });
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

  // Validation for edit form
  const validateEditForm = () => {
    const errors = {};
    
    if (!editForm.name.trim()) {
      errors.name = "Tên không được để trống";
    } else if (editForm.name.trim().length < 2) {
      errors.name = "Tên phải có ít nhất 2 ký tự";
    }
    
    if (!editForm.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      errors.email = "Email không hợp lệ";
    }
    
    if (editForm.phone.trim() && !/^[0-9+\-\s()]+$/.test(editForm.phone.trim())) {
      errors.phone = "Số điện thoại chỉ được chứa số và ký tự +, -, (, ), khoảng trắng";
    }
    
    return errors;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setEditValidationErrors(errors);
      return;
    }
    
    // Clear validation errors
    setEditValidationErrors({});
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3000/api/users/${editingUser._id}`, editForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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

  // Filter and search logic
  const filteredUsers = users.filter(user => {
    // Role filter
    if (filterRole !== 'all' && user.role !== filterRole) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search) ||
        user.address?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="user-list-container">
        <h2>Danh Sách Người Dùng</h2>
        <div className="loading-skeleton">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="skeleton-row">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-content">
                <div className="skeleton-text skeleton-title"></div>
                <div className="skeleton-text skeleton-subtitle"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-list-container">
      <h2>Danh Sách Người Dùng</h2>
      
      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Xóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>
        <div className="filter-box">
          <label htmlFor="role-filter">Vai trò:</label>
          <select
            id="role-filter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả</option>
            <option value="admin">Quản trị viên</option>
            <option value="user">Người dùng</option>
          </select>
        </div>
      </div>
      
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
                className={editValidationErrors.name ? 'error-input' : ''}
                required
              />
              {editValidationErrors.name && (
                <span className="field-error">{editValidationErrors.name}</span>
              )}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className={editValidationErrors.email ? 'error-input' : ''}
                required
              />
              {editValidationErrors.email && (
                <span className="field-error">{editValidationErrors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                className={editValidationErrors.phone ? 'error-input' : ''}
              />
              {editValidationErrors.phone && (
                <span className="field-error">{editValidationErrors.phone}</span>
              )}
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

      {filteredUsers.length === 0 ? (
        <div className="no-users-container">
          <p className="no-users">
            {searchTerm || filterRole !== 'all' 
              ? 'Không tìm thấy người dùng phù hợp' 
              : 'Chưa có người dùng nào'}
          </p>
          <p className="no-users-subtitle">
            {searchTerm || filterRole !== 'all'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
              : 'Hãy thêm người dùng đầu tiên bằng form bên trái'}
          </p>
        </div>
      ) : (
        <div className="user-table-container">
          <div className="table-header">
            <p className="user-count">
              {searchTerm || filterRole !== 'all' 
                ? `Tìm thấy ${filteredUsers.length} / ${users.length} người dùng`
                : `Tổng cộng: ${users.length} người dùng`}
            </p>
          </div>
          <table className="user-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id} className="user-row">
                  <td>
                    <div className="user-avatar">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </td>
                  <td className="user-name">{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td className="user-phone">{user.phone || 'Chưa cập nhật'}</td>
                  <td className="user-address">{user.address || 'Chưa cập nhật'}</td>
                  <td className="user-role">
                    <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                      {user.role === 'admin' ? 'Quản trị' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="user-actions">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="edit-btn"
                      title="Sửa thông tin"
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user)}
                      className="delete-btn"
                      title="Xóa người dùng"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="modal-close" onClick={handleDeleteCancel}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa người dùng này?</p>
              <div className="user-info-modal">
                <div className="user-avatar-modal">
                  {deleteModal.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="user-name-modal">{deleteModal.user.name}</p>
                  <p className="user-email-modal">{deleteModal.user.email}</p>
                </div>
              </div>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleDeleteCancel}>Hủy</button>
              <button className="btn-delete" onClick={handleDeleteConfirm}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;

