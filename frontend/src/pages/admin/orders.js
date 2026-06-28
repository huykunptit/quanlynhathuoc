import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import { Eye, Edit } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        alert('Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      alert('Lỗi kết nối');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Chờ xác nhận</span>;
      case 'confirmed': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Đã xác nhận</span>;
      case 'shipping': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">Đang giao</span>;
      case 'delivered': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Đã giao</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Đã hủy</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head><title>Quản lý đơn hàng - Admin</title></Head>
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>

        {loading ? (
          <p className="text-center">Đang tải...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3">Mã ĐH</th>
                  <th className="px-4 py-3">Ngày đặt</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Phương thức</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3">{new Date(o.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3">{o.total_amount.toLocaleString()}đ</td>
                    <td className="px-4 py-3">{o.payment_method}</td>
                    <td className="px-4 py-3">{getStatusBadge(o.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedOrder(o)} className="text-blue-600 hover:text-blue-800">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal Chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Ngày đặt:</p>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Trạng thái hiện tại:</p>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Phương thức thanh toán:</p>
                  <p className="font-medium">{selectedOrder.payment_method}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Tổng tiền:</p>
                  <p className="font-bold text-lg text-blue-600">{selectedOrder.total_amount.toLocaleString()}đ</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 mb-1">Địa chỉ giao hàng:</p>
                  <p className="font-medium">{selectedOrder.shipping_address || 'Không có'}</p>
                </div>
                {selectedOrder.note && (
                  <div className="col-span-2">
                    <p className="text-gray-500 mb-1">Ghi chú:</p>
                    <p className="font-medium italic">{selectedOrder.note}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3 border-b pb-2">Danh sách sản phẩm</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2">Sản phẩm ID</th>
                      <th className="pb-2 text-center">Số lượng</th>
                      <th className="pb-2 text-right">Đơn giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map(item => (
                      <tr key={item.id} className="border-t">
                        <td className="py-2">SP #{item.product_id}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right">{item.price.toLocaleString()}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-semibold mb-3 border-b pb-2">Cập nhật trạng thái</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => updateStatus(selectedOrder.id, 'pending')} className={`px-3 py-1 text-sm rounded border ${selectedOrder.status === 'pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' : 'hover:bg-gray-50'}`}>Chờ xác nhận</button>
                  <button onClick={() => updateStatus(selectedOrder.id, 'confirmed')} className={`px-3 py-1 text-sm rounded border ${selectedOrder.status === 'confirmed' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'hover:bg-gray-50'}`}>Đã xác nhận</button>
                  <button onClick={() => updateStatus(selectedOrder.id, 'shipping')} className={`px-3 py-1 text-sm rounded border ${selectedOrder.status === 'shipping' ? 'bg-indigo-100 border-indigo-500 text-indigo-800' : 'hover:bg-gray-50'}`}>Đang giao</button>
                  <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} className={`px-3 py-1 text-sm rounded border ${selectedOrder.status === 'delivered' ? 'bg-green-100 border-green-500 text-green-800' : 'hover:bg-gray-50'}`}>Đã giao</button>
                  <button onClick={() => updateStatus(selectedOrder.id, 'cancelled')} className={`px-3 py-1 text-sm rounded border ${selectedOrder.status === 'cancelled' ? 'bg-red-100 border-red-500 text-red-800' : 'hover:bg-gray-50'}`}>Hủy đơn</button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
