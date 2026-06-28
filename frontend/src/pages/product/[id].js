import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import Head from 'next/head';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`http://localhost:8000/products/${id}`);
      if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
      const data = await res.json();
      setProduct(data);
    } catch (err) {
      console.error(err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ product_id: product.id, name: product.name, price: product.price, quantity: quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    alert('Đã thêm vào giỏ hàng!');
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>;
  if (!product) return null;

  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };
  const firstWord = product.name.split(' ').slice(0, 2).join(' ');
  const image = product.image_url || `https://placehold.co/800x800/ffffff/2563eb?text=${encodeURIComponent(removeAccents(firstWord))}`;

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <Head>
        <title>{product.name} - QuantlyNhathuoc</title>
      </Head>

      {/* Breadcrumb */}
      <div className="flex text-sm text-gray-500 mb-6 space-x-2">
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push('/')}>Trang chủ</span>
        <span>/</span>
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => router.push(`/?search=${product.indications}`)}>{product.indications || 'Sản phẩm'}</span>
        <span>/</span>
        <span className="text-gray-800 font-medium truncate">{product.name}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Image (40%) */}
        <div className="w-full md:w-2/5 p-8 flex items-center justify-center bg-gray-50 border-r border-gray-100">
          <div className="relative w-full aspect-square mix-blend-multiply bg-white rounded-xl p-4">
            <img src={image} alt={product.name} className="w-full h-full object-contain drop-shadow-sm" />
          </div>
        </div>

        {/* Right: Info (60%) */}
        <div className="w-full md:w-3/5 p-8 flex flex-col">
          
          <div className="mb-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {product.indications || 'Dược phẩm'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-snug">
            {product.name}
          </h1>

          <div className="text-3xl font-black text-orange-600 mb-6">
            {product.price.toLocaleString()} đ
            <span className="text-sm font-medium text-gray-400 ml-3 line-through">{(product.price * 1.15).toLocaleString()} đ</span>
          </div>

          <p className="text-gray-600 text-sm mb-8 leading-relaxed border-b pb-6">
            {product.description}
          </p>

          <div className="flex items-end space-x-4 mb-8">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Số lượng</label>
              <div className="flex items-center border border-gray-300 rounded-xl h-12 w-32">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-l-xl">-</button>
                <input type="text" value={quantity} readOnly className="w-12 h-full text-center border-x border-gray-300 font-bold outline-none" />
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-r-xl">+</button>
              </div>
            </div>

            <button 
              onClick={addToCart}
              className="flex-grow h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md shadow-orange-500/20"
            >
              <ShoppingCart size={20} />
              <span>Thêm vào giỏ</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-6 mt-auto">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><ShieldCheck size={20} /></div>
              <span>Chính hãng 100%</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600"><RotateCcw size={20} /></div>
              <span>Đổi trả 30 ngày</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"><Truck size={20} /></div>
              <span>Giao siêu tốc</span>
            </div>
          </div>

        </div>
      </div>
      
      {/* Product Details Tabs (Mock) */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Thông tin chi tiết</h2>
        <div className="prose max-w-none text-gray-600 text-sm leading-relaxed">
          <p><strong>Thành phần chính:</strong> Xem trên bao bì sản phẩm.</p>
          <p><strong>Công dụng:</strong> {product.description}</p>
          <p><strong>Liều dùng và cách dùng:</strong> Đọc kỹ hướng dẫn sử dụng trước khi dùng hoặc tuân theo chỉ định của bác sĩ.</p>
          <p><strong>Bảo quản:</strong> Nơi khô ráo, thoáng mát, tránh ánh sáng trực tiếp. Để xa tầm tay trẻ em.</p>
          <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
            <strong>Lưu ý:</strong> Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Tác dụng của sản phẩm tùy thuộc vào cơ địa của mỗi người.
          </div>
        </div>
      </div>
    </div>
  );
}
