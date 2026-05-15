import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, NotebookText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem('ttm_user');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      const user = await loginService(data.email, data.password);
      login(user);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">

      {/* Info icon — top right corner */}
      <div className="fixed top-5 right-5 z-50 group">
        <div className="p-2 rounded-xl bg-white shadow-md border border-gray-100 cursor-pointer text-gray-400 hover:text-blue-500 hover:shadow-lg transition-all duration-200">
          <NotebookText size={28} />
        </div>

        {/* Tooltip card — appears on hover */}
        <div className="absolute right-0 top-14 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Project Info</p>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">📋</span>
              <div>
                <p className="text-xs text-gray-400">Project</p>
                <p className="text-sm font-medium text-gray-800">Team Task Management System</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">👤</span>
              <div>
                <p className="text-xs text-gray-400">Made by</p>
                <p className="text-sm font-medium text-gray-800">Yash Handa</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">📧</span>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">yash.handaint17@ethara.ai</p>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-start gap-2.5">
              <span className="text-base mt-0.5">🔐</span>
              <div>
                <p className="text-xs text-gray-400">Admin credentials</p>
                <p className="text-sm font-medium text-gray-800">yash.handaint17@ethara.ai</p>
                <p className="text-sm text-gray-500">Password: Yash@123</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md">

        {/* Company Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.jpeg"
            alt="Company Logo"
            className="h-48 w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm mb-6">Welcome back! Please sign in to your account.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
