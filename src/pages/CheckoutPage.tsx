import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle, CreditCard, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckoutFormData } from '../types';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<CheckoutFormData>({
    shipping_name: profile?.full_name || '',
    shipping_address: '',
    shipping_city: '',
    shipping_zip: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const tax = cartTotal * 0.08;
  const shipping = cartTotal >= 50 ? 0 : 9.99;
  const orderTotal = cartTotal + tax + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.shipping_name || !form.shipping_address || !form.shipping_city || !form.shipping_zip) {
      setError('Please fill in all shipping fields.');
      return;
    }
    if (cartItems.length === 0) { setError('Your cart is empty.'); return; }

    setLoading(true);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user!.id,
        status: 'confirmed',
        total: orderTotal,
        ...form,
      })
      .select()
      .maybeSingle();

    if (orderError || !order) {
      setError(orderError?.message || 'Failed to create order. Please try again.');
      setLoading(false);
      return;
    }

    // Insert order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product?.name || '',
      product_image: item.product?.image_url || '',
      quantity: item.quantity,
      price: item.product?.price ?? 0,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      setError(itemsError.message);
      setLoading(false);
      return;
    }

    await clearCart();
    setOrderId(order.id);
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
          <p className="text-xs text-gray-400 font-mono mb-6">Order #{orderId.slice(0, 8).toUpperCase()}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
            >
              View My Orders
            </button>
            <Link to="/products" className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/cart" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Shipping */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="shipping_name"
                      value={form.shipping_name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      name="shipping_address"
                      value={form.shipping_address}
                      onChange={handleChange}
                      placeholder="123 Main Street, Apt 4B"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                      <input
                        type="text"
                        name="shipping_city"
                        value={form.shipping_city}
                        onChange={handleChange}
                        placeholder="New York"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP Code</label>
                      <input
                        type="text"
                        name="shipping_zip"
                        value={form.shipping_zip}
                        onChange={handleChange}
                        placeholder="10001"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment (demo) */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment</h2>
                <p className="text-sm text-gray-500 mb-4">This is a demo — no real payment is collected.</p>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Demo Card Ending in 4242</p>
                    <p className="text-xs text-gray-400">Expires 12/26</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                {loading ? 'Placing Order...' : `Place Order — $${orderTotal.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-900 flex-shrink-0">
                      ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span><span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span><span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
