import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Settings, Users, Package, ShoppingCart } from 'lucide-react';
import Head from 'next/head';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch('http://localhost:8000/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.is_admin) {
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      } catch (err) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, []);

  if (loading) return <div className="text-center py-20">Đang kiểm tra quyền truy cập...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <Head>
        <title>Dashboard Quản Lý - QuantlyNhathuoc</title>
      </Head>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Quản lý tổng quan hoạt động của nhà thuốc</p>
        </div>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
          Quay lại Cửa hàng
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <Package size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Tổng sản phẩm</div>
            <div className="text-2xl font-bold text-gray-800">50</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <ShoppingCart size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Đơn hàng mới</div>
            <div className="text-2xl font-bold text-gray-800">12</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Khách hàng</div>
            <div className="text-2xl font-bold text-gray-800">1,248</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Settings size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Doanh thu</div>
            <div className="text-2xl font-bold text-gray-800">14.5M</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Quản lý chức năng</h2>
        </div>
        <div className="p-8 text-center text-gray-500 bg-gray-50">
          <p>Các module quản lý chi tiết (Sản phẩm, Đơn hàng, Bài viết) đang trong quá trình xây dựng.</p>
        </div>
      </div>
    </div>
  );
}
