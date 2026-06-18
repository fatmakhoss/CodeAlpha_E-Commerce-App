import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Accessories', 'Footwear', 'Furniture', 'Sports'];
const SORT_OPTIONS = [
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'created_at-desc', label: 'Newest First' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sort') || 'rating-desc';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'All') params.set(key, value);
    else params.delete(key);
    if (key !== 'search') params.delete('search');
    setSearchParams(params);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*');

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
    }
    if (selectedCategory && selectedCategory !== 'All') {
      query = query.eq('category', selectedCategory);
    }

    const [field, dir] = sortBy.split('-');
    query = query.order(field, { ascending: dir === 'asc' });

    const { data, error } = await query;
    if (!error && data) setProducts(data);
    setLoading(false);
  }, [searchQuery, selectedCategory, sortBy]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch.trim()) params.set('search', localSearch.trim());
    else params.delete('search');
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {searchQuery ? `Results for "${searchQuery}"` : selectedCategory !== 'All' ? selectedCategory : 'All Products'}
          </h1>
          {!loading && (
            <p className="text-gray-500 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search & Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              {localSearch && (
                <button type="button" onClick={() => { setLocalSearch(''); updateParam('search', ''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => setFiltersOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition sm:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => updateParam('sort', e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar - categories */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} sm:block w-full sm:w-48 flex-shrink-0`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { updateParam('category', cat); setFiltersOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedCategory === cat || (cat === 'All' && !selectedCategory)
                        ? 'bg-gray-900 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <LoadingSpinner className="h-64" />
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={() => { setSearchParams({}); setLocalSearch(''); }}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
