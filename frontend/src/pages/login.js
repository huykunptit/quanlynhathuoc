import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await fetch('http://localhost:8000/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });

        if (!res.ok) throw new Error('Email hoặc mật khẩu không đúng');
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        
        window.location.href = '/'; 
      } else {
        const res = await fetch('http://localhost:8000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: fullName })
        });

        if (!res.ok) throw new Error('Đăng ký thất bại, email có thể đã tồn tại');
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        window.location.href = '/'; 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-gray-50 pb-12">
      <div className="bg-white p-8 sm:p-10 border rounded-2xl shadow-xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
            <UserIcon size={24} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">
            {isLogin ? 'Đăng nhập hệ thống' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {isLogin ? 'Chào mừng bạn quay trở lại QuantlyNhathuoc!' : 'Đăng ký để trải nghiệm mua sắm thuốc dễ dàng'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100 flex items-center">
            <span className="font-bold mr-2">!</span> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <UserIcon size={18} />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all bg-gray-50 focus:bg-white"
                  placeholder="Nhập họ tên của bạn"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all bg-gray-50 focus:bg-white"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-gray-700 text-sm font-semibold">Mật khẩu</label>
              {isLogin && <a href="#" className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</a>}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md mt-4 flex justify-center items-center ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              isLogin ? 'Đăng nhập ngay' : 'Tạo tài khoản'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="text-blue-600 font-bold ml-2 hover:underline focus:outline-none"
            >
              {isLogin ? 'Đăng ký mới' : 'Đăng nhập'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
