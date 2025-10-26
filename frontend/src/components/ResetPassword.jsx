import { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './Auth.css';

const ResetPassword = ({ onBackToLogin, onSuccess }) => {
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!resetToken) {
      setError('Vui lòng nhập mã xác thực (reset token)');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        resetToken,
        password
      });

      setSuccessMessage(response.data.message || 'Đổi mật khẩu thành công!');
      setResetToken('');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        if (onBackToLogin) {
          onBackToLogin();
        }
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message || 
        'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng kiểm tra mã xác thực.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Đặt Lại Mật Khẩu</h2>
        <p className="auth-subtitle">Nhập mã xác thực từ email và mật khẩu mới</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              <div>
                <div>{successMessage}</div>
                <div className="redirect-text">Đang chuyển về trang đăng nhập...</div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="resetToken">Mã Xác Thực (Reset Token) *</label>
            <input
              type="text"
              id="resetToken"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              placeholder="Nhập mã từ email"
              disabled={loading}
              autoComplete="off"
            />
            <p className="auth-hint">Kiểm tra email để lấy mã xác thực</p>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật Khẩu Mới *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex="-1"
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu *</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                tabIndex="-1"
              >
                {showConfirmPassword ? '👁' : '👁‍🗨'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin(); }}>
              ← Quay lại Đăng nhập
            </a>
          </p>
          <p className="auth-hint">Mật khẩu mới sẽ được mã hóa và lưu trữ an toàn.</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

