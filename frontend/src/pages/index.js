import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useRouter } from 'next/router';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (router.query.search) {
      setSearch(router.query.search);
      fetchProducts(router.query.search);
    } else {
      fetchProducts();
    }
  }, [router.query.search]);

  const fetchProducts = async (query = '') => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/?search=${query}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Lỗi khi fetch sản phẩm:', error);
    }
  };

  return (
    <div className="pb-10">
      {/* Hero Banner Section */}
      {!search && (
        <div className="mb-8 rounded-2xl overflow-hidden relative shadow-md bg-blue-100 flex items-center justify-center" style={{ height: '300px' }}>
          <img 
            src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=300&fit=crop" 
            alt="Banner Khuyến mãi Y tế" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent flex items-center">
            <div className="px-10 text-white max-w-lg">
              <h2 className="text-3xl font-black mb-2">Chăm sóc sức khỏe toàn diện</h2>
              <p className="text-lg mb-4 text-blue-100">Sản phẩm chính hãng - Giao hàng siêu tốc</p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-bold transition-colors">Khám phá ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-end mb-6 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              {search ? (
                <>Kết quả tìm kiếm cho <span className="text-blue-600 ml-2">"{search}"</span></>
              ) : (
                <>
                  <span className="bg-orange-500 w-1.5 h-6 rounded-full mr-3 inline-block"></span>
                  Gợi ý hôm nay
                </>
              )}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Được chọn lọc và khuyên dùng bởi Dược sĩ</p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {products.length === 0 && (
          <div className="text-center text-gray-500 mt-10 py-10 bg-gray-50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Không tìm thấy sản phẩm nào. Thử tìm với từ khóa khác!
          </div>
        )}
      </div>

      {/* Info Banners Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-blue-50 p-6 rounded-xl flex flex-col items-center text-center">
          <img src="https://placehold.co/80x80/2563eb/ffffff?text=100%25" alt="Chinh hang" className="mb-4 rounded-full" />
          <h4 className="font-bold text-blue-900 mb-2">Thuốc chính hãng 100%</h4>
          <p className="text-sm text-gray-600">Tuyệt đối an tâm, đảm bảo chất lượng từ nhà sản xuất</p>
        </div>
        <div className="bg-orange-50 p-6 rounded-xl flex flex-col items-center text-center">
          <img src="https://placehold.co/80x80/ea580c/ffffff?text=30d" alt="Doi tra" className="mb-4 rounded-full" />
          <h4 className="font-bold text-orange-900 mb-2">Đổi trả 30 ngày</h4>
          <p className="text-sm text-gray-600">Đổi trả dễ dàng, miễn phí với sản phẩm nguyên vẹn</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl flex flex-col items-center text-center">
          <img src="https://placehold.co/80x80/16a34a/ffffff?text=Free" alt="Freeship" className="mb-4 rounded-full" />
          <h4 className="font-bold text-green-900 mb-2">Miễn phí giao hàng</h4>
          <p className="text-sm text-gray-600">Áp dụng cho mọi đơn hàng từ 300K</p>
        </div>
      </div>
    </div>
  );
}
