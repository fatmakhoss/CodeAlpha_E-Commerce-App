import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { ordersApi } from '../lib/api';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-orange-50 text-orange-700 border-orange-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setOrders(await ordersApi.myOrders());
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-6 h-6 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
            <Link to="/products" className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Order header */}
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border capitalize ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                      <button
                        onClick={() => setExpandedId(v => v === order.id ? null : order.id)}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition"
                      >
                        {expandedId === order.id ? (
                          <><ChevronUp className="w-4 h-4" /> Hide</>
                        ) : (
                          <><ChevronDown className="w-4 h-4" /> Details</>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 mt-3">
                    {order.order_items?.slice(0, 5).map(item => (
                      <div key={item.id} className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {(order.order_items?.length ?? 0) > 5 && (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-medium text-gray-500">
                        +{(order.order_items?.length ?? 0) - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === order.id && (
                  <div className="border-t border-gray-100">
                    <div className="p-5 space-y-3">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                            <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping To</h4>
                      <p className="text-sm text-gray-900 font-medium">{order.shipping_name}</p>
                      <p className="text-sm text-gray-500">{order.shipping_address}</p>
                      <p className="text-sm text-gray-500">{order.shipping_city}, {order.shipping_zip}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
