import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import './Auth.css';

const ForgotPassword = ({ onBackToLogin, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email
      });

      setSuccessMessage(response.data.message || 'Email khôi phục đã được gửi! Vui lòng kiểm tra hộp thư.');
      setEmail('');
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(email);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.message || 
        'Có lỗi xảy ra khi gửi email. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Quên Mật Khẩu</h2>
        <p className="auth-subtitle">Nhập email của bạn để nhận link đặt lại mật khẩu</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi Email Khôi Phục'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>
              ← Quay lại Đăng nhập
            </a>
          </p>
          <p className="auth-hint">Email có thể mất vài phút để đến. Hãy kiểm tra cả thư mục spam.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

