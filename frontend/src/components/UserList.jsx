import { useState, useEffect } from 'react';
import axios from 'axios';
import './UserList.css';

// Mock data for demo (Xóa phần này khi dùng API thật)
const MOCK_USERS = [
  {
    id: 1,
    name: 'Nguyễn Huy Điền',
    email: 'nguyenhuydien@example.com',
    phone: '0376611234',
    address: 'Cần Thơ, Việt Nam'
  },
  {
    id: 2,
    name: 'Dương Hoàng Duy',
    email: 'duonghoangduy@example.com',
    phone: '0912345678',
    address: 'Cần Thơ, Việt Nam'
  },
  {
    id: 3,
    name: 'Võ Trần Hoàng Bảo Khang',
    email: 'votranhoangbaokhang@example.com',
    phone: '0923456789',
    address: 'Cần Thơ, Việt Nam'
  }
];

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // MOCK: Dùng data giả để demo
    setTimeout(() => {
      setUsers(MOCK_USERS);
      setLoading(false);
    }, 500);

    // THẬT: Uncomment phần dưới khi backend đã chạy
    // fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối API.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
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
      {users.length === 0 ? (
        <p className="no-users">Chưa có người dùng nào</p>
      ) : (
        <div className="user-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;

