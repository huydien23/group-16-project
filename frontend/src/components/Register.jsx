import { useState } from 'react';
import axios from 'axios';
import './Auth.css';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validatePassword = (password) => {
    if (!password) {
      return "Mật khẩu không được để trống";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (password.length > 50) {
      return "Mật khẩu không được quá 50 ký tự";
    }
    return null;
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      return "Xác nhận mật khẩu không được để trống";
    }
    if (confirmPassword !== formData.password) {
      return "Mật khẩu xác nhận không khớp";
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    
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
    
    // Validate form
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
      
      const response = await axios.post('http://localhost:3000/api/auth/signup', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      // Không lưu token vào localStorage (chỉ thông báo thành công)
      let userData, tokenData;
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        userData = user;
        tokenData = token;
      } else {
        throw new Error(response.data.message || 'Đăng ký thất bại');
      }
      
      // Không hiển thị success message ở đây nữa (dùng toast notification)
      // setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Call callback to notify parent component (không login ngay)
      if (onRegisterSuccess) {
        onRegisterSuccess(userData, tokenData);
      }
      
    } catch (err) {
      console.error('Register error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError(err.response.data.errors.join(', '));
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Đăng Ký</h2>
        <p className="auth-subtitle">Tạo tài khoản mới để bắt đầu!</p>
        
        {success && (
          <div className="success-message">
            ✓ Đăng ký thành công! Chào mừng bạn!
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
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
              placeholder="Nhập email của bạn"
              className={validationErrors.email ? 'error-input' : ''}
              required
            />
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Mật khẩu <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className={validationErrors.password ? 'error-input' : ''}
              required
            />
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Xác nhận mật khẩu <span className="required">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              className={validationErrors.confirmPassword ? 'error-input' : ''}
              required
            />
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Đăng nhập ngay</a></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
