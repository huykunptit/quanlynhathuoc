import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
      alert('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return <span className="text-yellow-600 font-medium">Chờ xác nhận</span>;
      case 'confirmed': return <span className="text-blue-600 font-medium">Đã xác nhận</span>;
      case 'shipping': return <span className="text-indigo-600 font-medium">Đang giao hàng</span>;
      case 'delivered': return <span className="text-green-600 font-medium">Đã giao</span>;
      case 'cancelled': return <span className="text-red-600 font-medium">Đã hủy</span>;
      default: return status;
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Đã hủy đơn hàng');
        fetchOrders();
      } else {
        const errorData = await res.json();
        alert(`Lỗi: ${errorData.detail}`);
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi kết nối');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Lịch sử đơn hàng - Quản Lý Nhà Thuốc</title>
      </Head>

      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Lịch sử đơn hàng</h1>

        {loading ? (
          <p className="text-center text-gray-500 py-10">Đang tải dữ liệu...</p>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">Bạn chưa có đơn hàng nào.</p>
            <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">Mua sắm ngay</a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng: <span className="font-semibold text-gray-800">#{order.id}</span></p>
                    <p className="text-sm text-gray-500">Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <p>{getStatusText(order.status)}</p>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600"><span className="font-medium">Địa chỉ giao hàng:</span> {order.shipping_address || 'Không có'}</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Phương thức:</span> {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</p>
                    {order.note && <p className="text-sm text-gray-600"><span className="font-medium">Ghi chú:</span> {order.note}</p>}
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Sản phẩm:</h4>
                    <ul className="space-y-2">
                      {order.items.map(item => (
                        <li key={item.id} className="flex justify-between text-sm text-gray-600">
                          <span>Sản phẩm #{item.product_id} x {item.quantity}</span>
                          <span>{item.price.toLocaleString()}đ</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                  <p className="font-bold text-gray-800">
                    Tổng tiền: <span className="text-blue-600 text-lg">{order.total_amount.toLocaleString()}đ</span>
                  </p>
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition text-sm"
                    >
                      Hủy đơn hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
