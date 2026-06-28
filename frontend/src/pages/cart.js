import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    const token = localStorage.getItem('token');
    if (token) setUser({ token });
  }, []);

  const updateQuantity = (index, change) => {
    const newCart = [...cart];
    newCart[index].quantity += change;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng');
      router.push('/login');
      return;
    }
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const items = cart.map(item => ({ product_id: item.product_id, quantity: item.quantity }));
      const res = await fetch('http://localhost:8000/orders/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Đặt hàng thất bại');
      }

      alert('Đặt hàng thành công!');
      setCart([]);
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      router.push('/');
    } catch (err) {
      alert(err.message);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto pb-16">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <ShoppingBag className="mr-3" /> Giỏ hàng của bạn
      </h1>
      
      {cart.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
          <img src="https://placehold.co/200x200/f8fafc/cbd5e1?text=Empty+Cart" alt="Empty" className="mb-6 rounded-full" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-gray-500 mb-6">Hãy quay lại trang chủ và chọn những sản phẩm tốt nhất cho bạn nhé!</p>
          <Link href="/">
            <button className="bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-md">
              Tiếp tục mua sắm
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cột trái: Danh sách sản phẩm (70%) */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b text-sm font-semibold text-gray-600 flex justify-between">
                <span>Sản phẩm ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </div>
              <div className="p-0">
                {cart.map((item, index) => (
                  <div key={item.product_id} className="flex flex-col sm:flex-row items-center p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    {/* Ảnh SP */}
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 flex justify-center items-center overflow-hidden mb-4 sm:mb-0 sm:mr-4 border">
                      <img src={`https://placehold.co/100x100/e2e8f0/475569?text=${encodeURIComponent(item.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').substring(0, 5))}`} alt={item.name} className="object-cover w-full h-full mix-blend-multiply" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
                      <h3 className="font-semibold text-gray-800 line-clamp-2">{item.name}</h3>
                      <p className="text-orange-600 font-bold mt-1">{item.price.toLocaleString()} đ</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-6 sm:ml-4">
                      {/* Tăng giảm */}
                      <div className="flex items-center border border-gray-300 rounded-lg bg-white h-9 overflow-hidden">
                        <button onClick={() => updateQuantity(index, -1)} className="px-3 hover:bg-gray-100 text-gray-600 font-medium h-full">-</button>
                        <input type="text" value={item.quantity} readOnly className="w-10 text-center font-medium border-x border-gray-300 h-full text-sm outline-none" />
                        <button onClick={() => updateQuantity(index, 1)} className="px-3 hover:bg-gray-100 text-gray-600 font-medium h-full">+</button>
                      </div>
                      
                      {/* Giá tổng */}
                      <div className="font-bold text-gray-800 w-24 text-right hidden sm:block">
                        {(item.price * item.quantity).toLocaleString()} đ
                      </div>

                      {/* Nút xóa */}
                      <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Cột phải: Thanh toán (30%) */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-gray-800">{total.toLocaleString()} đ</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{total > 300000 ? 'Miễn phí' : '30,000 đ'}</span>
                </div>
                {total <= 300000 && (
                  <div className="text-xs text-blue-600 italic mt-1">
                    Mua thêm {(300000 - total).toLocaleString()} đ để được freeship
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-gray-800">Tổng cộng</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-orange-600">
                      {(total + (total > 300000 ? 0 : 30000)).toLocaleString()} đ
                    </span>
                    <p className="text-xs text-gray-400 mt-1">(Đã bao gồm VAT nếu có)</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 hover:shadow-lg transition-all active:scale-95"
              >
                Tiến hành thanh toán
              </button>

              {!user && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  <Link href="/login"><span className="text-blue-600 hover:underline font-semibold cursor-pointer">Đăng nhập</span></Link> để theo dõi đơn hàng dễ dàng hơn.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
