import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartPage() {
  const { cartItems, cartTotal, loading, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your cart</h2>
          <p className="text-gray-500 mb-6 text-sm">Your cart items are saved when you're logged in.</p>
          <Link to="/login" className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const tax = cartTotal * 0.08;
  const shipping = cartTotal >= 50 ? 0 : 9.99;
  const orderTotal = cartTotal + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
                <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={item.product?.image_url}
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product_id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm hover:underline line-clamp-2 mb-1">
                      {item.product?.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mb-3">{item.product?.category}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-50 transition"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-gray-900 min-w-[32px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-gray-50 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-gray-900">
                        ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-medium text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-900'}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400">Add ${(50 - cartTotal).toFixed(2)} more for free shipping</p>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-lg">${orderTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/products" className="block mt-3 text-center text-sm text-gray-500 hover:text-gray-900 transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
