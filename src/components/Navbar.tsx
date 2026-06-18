import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Package, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">ShopAlpha</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/products"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isActive('/products') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              Products
            </Link>

            <Link to="/cart" className="relative p-2 ml-1 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:block max-w-[100px] truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Package className="w-4 h-4" />
                      My Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/cart" className="relative p-2 rounded-lg text-gray-600">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(v => !v)} className="p-2 rounded-lg text-gray-600">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <form onSubmit={handleSearch} className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          </form>
          <div className="mt-3 flex flex-col gap-1">
            <Link to="/products" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Products</Link>
            {user ? (
              <>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Package className="w-4 h-4" />My Orders</Link>
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"><Shield className="w-4 h-4" />Admin Panel</Link>}
                <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"><LogOut className="w-4 h-4" />Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg text-center">Register</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Close user menu on outside click */}
      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </nav>
  );
}
