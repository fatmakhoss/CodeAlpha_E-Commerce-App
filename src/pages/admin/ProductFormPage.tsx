import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ProductFormData } from '../../types';

const CATEGORIES = ['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Furniture', 'Sports', 'General'];

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  price: '',
  category: 'Electronics',
  image_url: '',
  stock: '',
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
      if (data) {
        setForm({
          name: data.name,
          description: data.description,
          price: String(data.price),
          category: data.category,
          image_url: data.image_url,
          stock: String(data.stock),
        });
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim()) return 'Product name is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) return 'Enter a valid price.';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) return 'Enter a valid stock amount.';
    if (!form.image_url.trim()) return 'Image URL is required.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category,
      image_url: form.image_url.trim(),
      stock: Number(form.stock),
      updated_at: new Date().toISOString(),
    };

    let dbError;
    if (isEdit) {
      ({ error: dbError } = await supabase.from('products').update(payload).eq('id', id));
    } else {
      ({ error: dbError } = await supabase.from('products').insert({ ...payload, rating: 0, review_count: 0 }));
    }

    setSaving(false);
    if (dbError) { setError(dbError.message); return; }
    setSuccess(true);
    setTimeout(() => navigate('/admin'), 1200);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Product {isEdit ? 'updated' : 'created'}!
          </h2>
          <p className="text-gray-500 mt-1">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/admin" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        <div className="bg-white rounded-2xl border border-gray-100 p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-6 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Headphones Pro"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product in detail..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL *</label>
              <input
                type="url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://images.pexels.com/..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                required
              />
              {form.image_url && (
                <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition disabled:opacity-60"
              >
                {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
              <Link
                to="/admin"
                className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
