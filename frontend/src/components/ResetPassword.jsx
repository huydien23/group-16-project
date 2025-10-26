import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const ResetPassword = ({ onBackToLogin }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Link không hợp lệ. Vui lòng yêu cầu link reset mới.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError('Link không hợp lệ');
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
      const response = await axios.put(
        `http://localhost:3000/api/auth/reset-password/${token}`,
        { password }
      );

      if (response.data.success) {
        setSuccessMessage('Đổi mật khẩu thành công!');
        
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        setTimeout(() => {
          if (response.data.data.token) {
            navigate('/profile');
          } else {
            if (onBackToLogin) {
              onBackToLogin();
            } else {
              navigate('/login');
            }
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message || 
        'Có lỗi xảy ra khi đặt lại mật khẩu. Link có thể đã hết hạn (10 phút).'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin();
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Đặt Lại Mật Khẩu</h2>
        <p className="auth-subtitle">Nhập mật khẩu mới của bạn</p>

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
            <label htmlFor="password">Mật Khẩu Mới *</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                disabled={loading || !token}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex="-1"
              >
                {showPassword ? '' : ''}
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
                disabled={loading || !token}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                tabIndex="-1"
              >
                {showConfirmPassword ? '' : ''}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading || !token}
          >
            {loading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <a href="#" onClick={(e) => { e.preventDefault(); handleBackToLogin(); }}>
              Quay lại Đăng nhập
            </a>
          </p>
          <p className="auth-hint">Link reset chỉ có hiệu lực trong 10 phút.</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
