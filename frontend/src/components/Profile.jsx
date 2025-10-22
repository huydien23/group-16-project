import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

function Profile() {
  const { user: currentUser, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const userData = response.data.data;
        setProfileData(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate name
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Tên không được để trống';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Tên phải có ít nhất 2 ký tự';
    }

    // Validate email
    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Validate phone (optional but if provided, must be valid)
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await axios.put(
        'http://localhost:3000/api/auth/updateprofile',
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setProfileData(response.data.data);
        setSuccess('Cập nhật thông tin thành công!');
        setIsEditing(false);
        
        // Update user in localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData.name || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      address: profileData.address || ''
    });
    setValidationErrors({});
    setError(null);
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Thông Tin Cá Nhân</h1>
        <p>Xem và cập nhật thông tin tài khoản của bạn</p>
      </div>

      <div className="profile-content">
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">✕</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        <div className="profile-card">
          <div className="profile-card-header">
            <h2>{isEditing ? 'Chỉnh Sửa Thông Tin' : 'Thông Tin Tài Khoản'}</h2>
            {!isEditing && (
              <button 
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <span className="btn-icon">✎</span>
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className="profile-avatar">
            {getInitials(profileData.name)}
          </div>

          {!isEditing ? (
            // View Mode
            <div className="profile-info">
              <div className="profile-info-item">
                <span className="profile-info-label">Họ và tên:</span>
                <span className="profile-info-value">{profileData.name}</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Email:</span>
                <span className="profile-info-value">{profileData.email}</span>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Số điện thoại:</span>
                <span className={`profile-info-value ${!profileData.phone ? 'empty' : ''}`}>
                  {profileData.phone || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Địa chỉ:</span>
                <span className={`profile-info-value ${!profileData.address ? 'empty' : ''}`}>
                  {profileData.address || 'Chưa cập nhật'}
                </span>
              </div>

              <div className="profile-info-item">
                <span className="profile-info-label">Vai trò:</span>
                <span className="profile-info-value">
                  {profileData.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </span>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <span className="label-icon">👤</span>
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                  autoComplete="name"
                />
                {validationErrors.name && (
                  <span className="error-message">{validationErrors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">📧</span>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Nhập email"
                  autoComplete="email"
                />
                {validationErrors.email && (
                  <span className="error-message">{validationErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">📱</span>
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  autoComplete="tel"
                />
                {validationErrors.phone && (
                  <span className="error-message">{validationErrors.phone}</span>
                )}
                <span className="input-hint">Ví dụ: 0912345678</span>
              </div>

              <div className="form-group full-width">
                <label>
                  <span className="label-icon">🏠</span>
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ đầy đủ"
                  rows="3"
                />
              </div>

              <div className="profile-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <span className="btn-icon">{saving ? '⏳' : '💾'}</span>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;

