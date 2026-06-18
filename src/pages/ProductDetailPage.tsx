import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Package, Shield, Truck, Minus, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addMessage, setAddMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
      if (!data) { navigate('/products'); return; }
      setProduct(data);

      const { data: rel } = await supabase
        .from('products')
        .select('*')
        .eq('category', data.category)
        .neq('id', id)
        .limit(4);
      if (rel) setRelated(rel);
      setLoading(false);
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    const { error } = await addToCart(product!.id, quantity);
    setAdding(false);
    setAddMessage(error ? { type: 'error', text: error } : { type: 'success', text: 'Added to cart!' });
    setTimeout(() => setAddMessage(null), 2500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!product) return null;

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-900 transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-900 transition">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-gray-900 transition">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </div>

        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div>
            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full font-medium mb-3">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {stars.map((filled, i) => (
                  <Star key={i} className={`w-4 h-4 ${filled ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.review_count.toLocaleString()} reviews)</span>
            </div>

            <p className="text-4xl font-bold text-gray-900 mb-5">${product.price.toFixed(2)}</p>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-700' : product.stock > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                {product.stock === 0 ? 'Out of Stock' : product.stock <= 10 ? `Only ${product.stock} left` : 'In Stock'}
              </span>
            </div>

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 hover:bg-gray-50 transition"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[40px] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-3 py-2 hover:bg-gray-50 transition"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                {addMessage && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                    addMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {addMessage.text}
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition disabled:opacity-60"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            )}

            {/* Trust icons */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
              {[
                { icon: Shield, label: 'Secure Checkout' },
                { icon: Truck, label: 'Free Shipping' },
                { icon: Package, label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-gray-600 text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">More in {product.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {related.map(rel => (
                <Link key={rel.id} to={`/products/${rel.id}`} className="group block">
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mb-3 group-hover:shadow-md transition">
                    <img src={rel.image_url} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{rel.name}</p>
                  <p className="text-sm font-bold text-gray-700 mt-0.5">${rel.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
