import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../../components/Navbar';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Convert price and stock to numbers
    const payload = {
      ...currentProduct,
      price: Number(currentProduct.price),
      stock: Number(currentProduct.stock)
    };

    const url = currentProduct.id 
      ? `${process.env.NEXT_PUBLIC_API_URL}/products/${currentProduct.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/products/`;
      
    const method = currentProduct.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        fetchProducts();
      } else {
        alert('Lưu thất bại');
      }
    } catch (error) {
      alert('Lỗi kết nối');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này? (Soft delete)')) return;
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchProducts();
      } else {
        alert('Xóa thất bại');
      }
    } catch (error) {
      alert('Lỗi kết nối');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
    } else {
      setCurrentProduct({
        name: '', description: '', price: 0, stock: 0, image_url: '',
        indications: '', active_ingredient: '', contraindications: '', dosage: ''
      });
    }
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head><title>Quản lý sản phẩm - Admin</title></Head>
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <button 
            onClick={() => openModal()}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={20} className="mr-2" /> Thêm sản phẩm
          </button>
        </div>

        {loading ? (
          <p className="text-center">Đang tải...</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Tồn kho</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{p.id}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.price.toLocaleString()}đ</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      {p.is_active ? (
                        <span className="text-green-600 font-medium">Đang bán</span>
                      ) : (
                        <span className="text-red-600 font-medium">Đã ẩn</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openModal(p)} className="text-blue-500 hover:text-blue-700 mr-3">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && currentProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{currentProduct.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                  <input required type="text" className="w-full border rounded p-2" 
                    value={currentProduct.name || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Giá (VNĐ) *</label>
                  <input required type="number" className="w-full border rounded p-2" 
                    value={currentProduct.price} 
                    onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tồn kho *</label>
                  <input required type="number" className="w-full border rounded p-2" 
                    value={currentProduct.stock} 
                    onChange={e => setCurrentProduct({...currentProduct, stock: e.target.value})} />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">URL Hình ảnh</label>
                  <input type="text" className="w-full border rounded p-2" 
                    value={currentProduct.image_url || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, image_url: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Chỉ định (Keywords gợi ý)</label>
                  <input type="text" className="w-full border rounded p-2" placeholder="Ví dụ: đau đầu, sổ mũi, cảm cúm"
                    value={currentProduct.indications || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, indications: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Hoạt chất chính</label>
                  <input type="text" className="w-full border rounded p-2" 
                    value={currentProduct.active_ingredient || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, active_ingredient: e.target.value})} />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Liều dùng</label>
                  <textarea className="w-full border rounded p-2" rows="2"
                    value={currentProduct.dosage || ''} 
                    onChange={e => setCurrentProduct({...currentProduct, dosage: e.target.value})} />
                </div>

                <div className="col-span-2 flex items-center">
                  <input type="checkbox" id="isActive" className="mr-2"
                    checked={currentProduct.is_active !== false}
                    onChange={e => setCurrentProduct({...currentProduct, is_active: e.target.checked})} />
                  <label htmlFor="isActive" className="text-sm font-medium">Sản phẩm đang bán (is_active)</label>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
