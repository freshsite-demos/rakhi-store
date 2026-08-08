import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { loginAdmin } from '../../services/auth.service';
import { Lock, Mail, ArrowLeft } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginAdmin(email, password);
      if (res.success && res.token) {
        login(res.token, res.admin.email);
        showToast('Login successful!', 'success');
        navigate('/admin/dashboard');
      } else {
        showToast('Invalid email or password', 'error');
      }
    } catch (err: any) {
      console.error('Login failed', err);
      showToast(err.response?.data?.message || 'Invalid email or password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-800 font-bold text-xs uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-black text-xl shadow-md mb-4">
          ⚙️
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight">
          Admin Portal
        </h2>
        <p className="text-zinc-500 text-sm mt-1.5 font-medium">
          Sign in to manage your Rakhi Store
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-zinc-100 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col gap-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@rakhistore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-900 transition-all placeholder-zinc-400"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-400" />
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-zinc-900 transition-all placeholder-zinc-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2 uppercase tracking-widest"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
export default Login;
