import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Users, TrendingUp, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Stats {
  products: number;
  orders: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({ products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [{ data: prods }, { data: orders }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('total, status'),
    ]);

    if (prods) setProducts(prods);
    if (prods && orders) {
      setStats({
        products: prods.length,
        orders: orders.length,
        revenue: orders.reduce((s, o) => s + (o.total || 0), 0),
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    setDeletingId(id);
    setDeleteError('');
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setDeleteError(error.message);
    } else {
      setProducts(prev => prev.filter(p => p.id !== id));
      setStats(s => ({ ...s, products: s.products - 1 }));
    }
    setDeletingId(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your store</p>
          </div>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { icon: Package, label: 'Total Products', value: stats.products, color: 'bg-blue-50 text-blue-600' },
            { icon: ShoppingBag, label: 'Total Orders', value: stats.orders, color: 'bg-green-50 text-green-600' },
            { icon: TrendingUp, label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, color: 'bg-orange-50 text-orange-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-500">{label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {deleteError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-4 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {deleteError}
          </div>
        )}

        {/* Products table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Products ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Price</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Stock</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Rating</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[200px]">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{product.category}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-gray-900">${product.price.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-700">{product.rating.toFixed(1)} ★</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deletingId === product.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
