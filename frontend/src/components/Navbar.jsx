import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ShoppingCart, User, Search, Menu, Phone, Heart } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (router.query.search) {
      setSearchQuery(router.query.search);
    } else {
      setSearchQuery('');
    }
  }, [router.query.search]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8000/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUser({ ...data, token }))
      .catch(err => setUser({ token }));
    }

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    // Custom event to trigger re-render on cart update
    window.addEventListener('cart-updated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white sticky top-0 z-40 shadow-sm border-b">
      {/* Top Banner (Optional for promos) */}
      <div className="bg-blue-700 text-white text-xs text-center py-1">
        Freeship toàn quốc cho đơn hàng từ 300K! 
      </div>

      <div className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between py-4">
          
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer mr-8">
              <div className="bg-blue-600 text-white font-black text-2xl p-1 rounded-md tracking-tighter shadow flex items-center justify-center w-10 h-10 mr-2">
                Q
              </div>
              <span className="text-2xl font-bold text-blue-800 tracking-tight hidden sm:block">
                Quanly<span className="text-orange-500">Nhathuoc</span>
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-grow max-w-2xl hidden md:flex items-center bg-gray-100 rounded-full border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden h-11">
            <input 
              type="text" 
              placeholder="Tìm kiếm tên thuốc, triệu chứng, hoạt chất..." 
              className="w-full bg-transparent border-none outline-none px-4 text-gray-700 placeholder-gray-400 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/?search=${searchQuery}`);
                }
              }}
            />
            <button 
              onClick={() => router.push(`/?search=${searchQuery}`)}
              className="bg-blue-600 text-white px-5 h-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-6 ml-6">
            <div className="hidden lg:flex items-center space-x-2 text-blue-800 hover:text-blue-600 cursor-pointer transition-colors">
              <div className="bg-blue-50 p-2 rounded-full">
                <Phone size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500">Tư vấn miễn phí</span>
                <span className="text-sm font-bold">1800 1234</span>
              </div>
            </div>

            <Link href="/cart">
              <div className="relative flex flex-col items-center justify-center cursor-pointer text-gray-700 hover:text-blue-600 transition-colors group">
                <div className="relative p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium mt-1">Giỏ hàng</span>
              </div>
            </Link>

            {user ? (
              <div className="relative group flex flex-col items-center cursor-pointer text-gray-700 hover:text-blue-600">
                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-50 transition-colors">
                  <User size={22} />
                </div>
                <span className="text-[11px] font-medium mt-1">Tài khoản</span>
                
                <div className="absolute top-12 right-0 bg-white border shadow-lg rounded-lg w-48 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-800 font-medium border-b mb-1">
                    Xin chào, {user.full_name || 'Khách'}
                  </div>
                  <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">Đơn hàng của tôi</div>
                  {user.is_admin && (
                    <div onClick={() => router.push('/admin/dashboard')} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-blue-600 font-medium">
                      Dashboard Quản lý
                    </div>
                  )}
                  <div onClick={handleLogout} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-red-600 font-medium">Đăng xuất</div>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <div className="flex flex-col items-center cursor-pointer text-gray-700 hover:text-blue-600">
                  <div className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 transition-colors">
                    <User size={22} />
                  </div>
                  <span className="text-[11px] font-medium mt-1">Đăng nhập</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="border-t bg-gray-50 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex items-center space-x-8 py-2 text-sm font-medium text-gray-600 h-10">
            <li className="relative group flex items-center text-blue-700 cursor-pointer h-full">
              <Menu size={16} className="mr-1" /> Danh mục
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 bg-white border shadow-lg rounded-lg w-56 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div onClick={() => router.push('/')} className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b">Tất cả sản phẩm</div>
                <div onClick={() => router.push('/?search=Thực phẩm chức năng')} className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors">Thực phẩm chức năng</div>
                <div onClick={() => router.push('/?search=Dược mỹ phẩm')} className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors">Dược mỹ phẩm</div>
                <div onClick={() => router.push('/?search=Chăm sóc cá nhân')} className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors">Chăm sóc cá nhân</div>
                <div onClick={() => router.push('/?search=Thiết bị y tế')} className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors">Thiết bị y tế</div>
                <div onClick={() => router.push('/?search=Giảm đau')} className="px-4 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors">Giảm đau, hạ sốt</div>
              </div>
            </li>
            <li className="flex items-center hover:text-blue-600 cursor-pointer transition-colors h-full" onClick={() => router.push('/?search=Thực phẩm chức năng')}>Thực phẩm chức năng</li>
            <li className="flex items-center hover:text-blue-600 cursor-pointer transition-colors h-full" onClick={() => router.push('/?search=Dược mỹ phẩm')}>Dược mỹ phẩm</li>
            <li className="flex items-center hover:text-blue-600 cursor-pointer transition-colors h-full" onClick={() => router.push('/?search=Chăm sóc cá nhân')}>Chăm sóc cá nhân</li>
            <li className="flex items-center hover:text-blue-600 cursor-pointer transition-colors h-full" onClick={() => router.push('/?search=Thiết bị y tế')}>Thiết bị y tế</li>
            <li className="flex items-center hover:text-blue-600 cursor-pointer transition-colors text-orange-500 h-full" onClick={() => router.push('/?search=Giảm đau')}>
              Giảm đau, hạ sốt <Heart size={14} className="ml-1 fill-orange-500" />
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
