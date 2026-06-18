import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(product.id);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-500">Out of Stock</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs px-2 py-1 rounded-full font-medium border border-gray-100">
              {product.category}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-gray-700 transition">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-gray-700">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.review_count.toLocaleString()})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                added
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : product.stock === 0
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {added ? 'Added!' : adding ? '...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
