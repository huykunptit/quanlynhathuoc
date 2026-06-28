import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Stethoscope, Loader2, ShoppingCart } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Chào bạn, tôi là Dược sĩ ảo. Hãy nói cho tôi biết bạn đang gặp triệu chứng gì để tôi tư vấn nhé!' }]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const addToCart = (product) => {
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, session_id: sessionId })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Lỗi server');
      }
      
      if (!sessionId) setSessionId(data.session_id);

      setMessages([...newMessages, { 
        sender: 'bot', 
        text: data.reply || 'Xin lỗi, tôi không thể trả lời lúc này.',
        products: data.recommended_products || []
      }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'bot', text: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-96 h-[500px] shadow-2xl rounded-2xl flex flex-col border border-gray-100 overflow-hidden transform transition-all duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Stethoscope size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Dược sĩ AI</h3>
                <div className="flex items-center text-[10px] text-blue-100">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                  Đang hoạt động
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Chat Body */}
          <div className="flex-grow p-4 overflow-y-auto bg-[#f8fafc] flex flex-col space-y-4 text-sm scroll-smooth">
            <div className="text-center text-xs text-gray-400 mb-2">Hôm nay</div>
            
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col space-y-2">
                <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Stethoscope size={14} className="text-blue-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] p-3 shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-white text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100'
                  } break-words whitespace-pre-wrap leading-relaxed`}>
                    {/* Parse markdown-like syntax safely (basic implementation for bold) */}
                    {(msg.text || '').split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                  </div>
                </div>

                {/* Render recommended products if available */}
                {msg.sender === 'bot' && msg.products && msg.products.length > 0 && (
                  <div className="ml-10 pr-4 flex flex-col space-y-2 mt-1">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sản phẩm khuyên dùng:</span>
                    <div className="flex flex-col space-y-2">
                      {msg.products.map((product) => {
                        // Helper for product placeholder image
                        const removeAccents = (str) => {
                          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
                        };
                        const firstWord = product.name.split(' ').slice(0, 2).join(' ');
                        const placeholderImg = product.image_url || `https://placehold.co/100x100/ffffff/2563eb?text=${encodeURIComponent(removeAccents(firstWord))}`;
                        
                        return (
                          <div key={product.id} className="bg-white border rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 min-w-0 flex-grow">
                              <img src={placeholderImg} alt={product.name} className="w-10 h-10 object-contain rounded border flex-shrink-0" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h4>
                                <span className="text-xs font-bold text-orange-600">{product.price.toLocaleString()} đ</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => addToCart(product)}
                              className="ml-2 bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0 flex items-center justify-center"
                              title="Thêm vào giỏ"
                            >
                              <ShoppingCart size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Stethoscope size={14} className="text-blue-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex space-x-1 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all pr-1">
              <input 
                type="text" 
                className="flex-grow bg-transparent border-none px-4 py-2.5 focus:outline-none text-sm text-gray-700"
                placeholder="Nhập triệu chứng của bạn..." 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend} 
                disabled={!input.trim() || loading}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                  input.trim() && !loading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </div>
            <div className="text-[10px] text-center text-gray-400 mt-2">
              Chatbot chỉ mang tính chất tham khảo. Không thay thế chẩn đoán y khoa.
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="relative group bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <MessageCircle size={28} />
          
          {/* Notification dot */}
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        </button>
      )}
    </div>
  );
}
