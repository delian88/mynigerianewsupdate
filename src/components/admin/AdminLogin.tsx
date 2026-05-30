import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      toast.success('Logged in successfully');
      navigate('/admin/settings');
    } else {
      toast.error('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-nag-gray-bg flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-nag-border">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-nag-green-primary rounded-full flex items-center justify-center text-white">
            <Lock size={32} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-center mb-6 text-nag-black">CMS Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nag-gray-deep mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary focus:border-transparent outline-none transition-all"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-nag-green-primary text-white font-bold py-3 rounded-xl hover:bg-opacity-90 transition-all"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
