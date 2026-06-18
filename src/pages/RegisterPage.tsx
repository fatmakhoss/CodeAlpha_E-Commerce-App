import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (user) { navigate('/'); return null; }

  const validate = () => {
    if (!form.fullName.trim()) return 'Please enter your full name.';
    if (!form.email) return 'Please enter your email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName.trim());
    setLoading(false);
    if (error) { setError(error); return; }
    setSuccess(true);
    setTimeout(() => navigate('/'), 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Account created!</h2>
          <p className="text-gray-500 mt-1">Redirecting to shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">ShopAlpha</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-500 mt-1">Join ShopAlpha today</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-5 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-sm text-center text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-gray-900 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
