import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, RefreshCw, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Furniture', 'Sports'];
const CATEGORY_ICONS: Record<string, string> = {
  Electronics: '💻', Clothing: '👕', Accessories: '⌚', Footwear: '👟', Furniture: '🪑', Sports: '🏃',
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(8);
      if (data) setFeatured(data);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0ea5e9 0%, transparent 40%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              New arrivals every week
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
              Shop the
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                future
              </span>
              today.
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-xl">
              Discover premium products across electronics, fashion, accessories and more. Quality you can trust, prices you'll love.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="flex items-center gap-2 px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 hover:gap-3"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products?category=Electronics"
                className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition backdrop-blur-sm"
              >
                Explore Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Secure Payments', desc: 'SSL encrypted checkout' },
              { icon: RefreshCw, title: 'Free Returns', desc: '30-day return policy' },
              { icon: Zap, title: 'Fast Shipping', desc: '2-5 business days' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100">
                <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-500 mt-1">Find exactly what you're looking for</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="group flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-900 hover:border-gray-900 transition-all duration-200"
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-white transition">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Rated Products</h2>
            <p className="text-gray-500 mt-1">Loved by thousands of customers</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner className="h-64" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Stats banner */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Happy Customers' },
              { value: '500+', label: 'Products' },
              { value: '4.8', label: 'Avg. Rating', icon: Star },
              { value: '99%', label: 'Satisfaction Rate' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
