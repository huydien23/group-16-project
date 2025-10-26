import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
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
  const [validationErrors, setValidationErrors] = useState({});

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return "Tên không được để trống";
    }
    if (name.trim().length < 2) {
      return "Tên phải có ít nhất 2 ký tự";
    }
    if (name.trim().length > 50) {
      return "Tên không được quá 50 ký tự";
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email không được để trống";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Email không hợp lệ";
    }
    return null;
  };

  const validatePhone = (phone) => {
    if (phone.trim() && !/^[0-9+\-\s()]+$/.test(phone.trim())) {
      return "Số điện thoại chỉ được chứa số và ký tự +, -, (, ), khoảng trắng";
    }
    if (phone.trim() && phone.trim().length < 10) {
      return "Số điện thoại phải có ít nhất 10 số";
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    setError(null);
    setSuccess(false);
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Advanced validation
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Vui lòng sửa các lỗi bên dưới');
      return;
    }
    
    // Clear validation errors
    setValidationErrors({});

    try {
      setLoading(true);
      setError(null);
      
      const newUser = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/users`, newUser, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
          Thêm người dùng thành công!
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
            className={validationErrors.name ? 'error-input' : ''}
            required
          />
          {validationErrors.name && (
            <span className="field-error">{validationErrors.name}</span>
          )}
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
            className={validationErrors.email ? 'error-input' : ''}
            required
          />
          {validationErrors.email && (
            <span className="field-error">{validationErrors.email}</span>
          )}
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
            className={validationErrors.phone ? 'error-input' : ''}
          />
          {validationErrors.phone && (
            <span className="field-error">{validationErrors.phone}</span>
          )}
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

