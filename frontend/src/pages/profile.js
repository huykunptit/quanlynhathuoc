import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        alert('Cập nhật hồ sơ thành công');
      } else {
        alert('Cập nhật thất bại');
      }
    } catch (error) {
      alert('Lỗi kết nối');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(passwords)
      });
      if (res.ok) {
        alert('Đổi mật khẩu thành công');
        setPasswords({ current_password: '', new_password: '' });
      } else {
        const data = await res.json();
        alert(data.detail || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      alert('Lỗi kết nối');
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Hồ sơ cá nhân - Quản Lý Nhà Thuốc</title>
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Hồ sơ cá nhân</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Thông tin liên hệ</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input 
                type="text" 
                className="w-full border rounded-md px-3 py-2"
                value={profile.full_name}
                onChange={e => setProfile({...profile, full_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input 
                type="text" 
                className="w-full border rounded-md px-3 py-2"
                value={profile.phone}
                onChange={e => setProfile({...profile, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng mặc định</label>
              <textarea 
                className="w-full border rounded-md px-3 py-2"
                rows="3"
                value={profile.address}
                onChange={e => setProfile({...profile, address: e.target.value})}
              ></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Lưu thông tin
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Đổi mật khẩu</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input 
                type="password" 
                required
                className="w-full border rounded-md px-3 py-2"
                value={passwords.current_password}
                onChange={e => setPasswords({...passwords, current_password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input 
                type="password" 
                required
                className="w-full border rounded-md px-3 py-2"
                value={passwords.new_password}
                onChange={e => setPasswords({...passwords, new_password: e.target.value})}
              />
            </div>
            <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900">
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
