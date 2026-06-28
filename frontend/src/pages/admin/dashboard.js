import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Settings, Users, Package, ShoppingCart } from 'lucide-react';
import Head from 'next/head';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const checkAdminAndFetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.is_admin) {
          setIsAdmin(true);
          const statsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(statsData);
          }
        } else {
          router.push('/');
        }
      } catch (err) {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAndFetchStats();
  }, [router]);

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
            <div className="text-2xl font-bold text-gray-800">{stats ? stats.total_products : '-'}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
            <ShoppingCart size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Đơn chờ xử lý</div>
            <div className="text-2xl font-bold text-gray-800">{stats ? stats.pending_orders : '-'}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Khách hàng</div>
            <div className="text-2xl font-bold text-gray-800">{stats ? stats.total_users : '-'}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Settings size={28} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-500">Doanh thu</div>
            <div className="text-2xl font-bold text-gray-800">{stats ? stats.total_revenue.toLocaleString() : '-'}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-semibold">Mã ĐH</th>
                <th className="px-6 py-3 font-semibold">Tổng tiền</th>
                <th className="px-6 py-3 font-semibold">Trạng thái</th>
                <th className="px-6 py-3 font-semibold">Thanh toán</th>
                <th className="px-6 py-3 font-semibold">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_orders?.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-6 py-4">#{order.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{order.total_amount.toLocaleString()} đ</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{order.payment_method === 'COD' ? 'COD' : 'Chuyển khoản'}</td>
                  <td className="px-6 py-4">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {(!stats || !stats.recent_orders || stats.recent_orders.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Không có đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
