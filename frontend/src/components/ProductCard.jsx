import React from 'react';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ product_id: product.id, name: product.name, price: product.price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    // Dispatch event so Navbar updates immediately
    window.dispatchEvent(new Event('cart-updated'));
    alert('Đã thêm vào giỏ hàng!');
  };

  // Lấy chữ cái hoặc từ đầu tiên để làm ảnh placeholder cho đúng sản phẩm
  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };
  const firstWord = product.name.split(' ').slice(0, 2).join(' ');
  const placeholderImg = product.image_url || `https://placehold.co/400x400/ffffff/2563eb?text=${encodeURIComponent(removeAccents(firstWord))}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden">
      
      {/* Discount badge - Mock */}
      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
        -10%
      </div>

      {/* Image */}
      <Link href={`/product/${product.id}`}>
        <div className="relative w-full aspect-square mb-4 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer">
          <img 
            src={placeholderImg} 
            alt={product.name} 
            className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500 p-2"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-grow">
        <span className="text-[11px] font-semibold text-blue-600 mb-1 uppercase tracking-wider">{product.indications?.substring(0, 20) || 'Thuốc & Y tế'}</span>
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-blue-700 transition-colors cursor-pointer" title={product.name}>
            {product.name}
          </h3>
        </Link>
        
        {/* Pricing */}
        <div className="mt-auto pt-2">
          <div className="text-xs text-gray-400 line-through mb-0.5">{(product.price * 1.1).toLocaleString()} đ</div>
          <div className="text-lg font-bold text-orange-600 mb-4">{product.price.toLocaleString()} đ</div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(); }}
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors active:scale-95"
          >
            <ShoppingCart size={16} />
            <span className="text-sm">Chọn mua</span>
          </button>
        </div>
      </div>
    </div>
  );
}
