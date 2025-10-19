import { useState } from 'react';
import axios from 'axios';
import './AddUser.css';

function AddUser({ onUserAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Vui lòng nhập tên và email');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newUser = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      await axios.post('http://localhost:3000/users', newUser);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: ''
      });
      
      setSuccess(true);
      
      // Call callback to refresh user list
      if (onUserAdded) {
        onUserAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError('Không thể thêm người dùng. Vui lòng thử lại.');
      console.error('Error adding user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-user-container">
      <h2>Thêm Người Dùng Mới</h2>
      
      {success && (
        <div className="success-message">
          ✓ Thêm người dùng thành công!
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">
            Tên <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên người dùng"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Số điện thoại</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Địa chỉ</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ"
            rows="3"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Đang xử lý...' : 'Thêm Người Dùng'}
        </button>
      </form>
    </div>
  );
}

export default AddUser;

