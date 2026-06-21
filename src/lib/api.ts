import { CartItem, Order, Product } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'shopalpha_token';

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AppSession {
  token: string;
}

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const token = tokenStore.get();
  if (options.auth !== false && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      `Cannot reach the API at ${API_BASE_URL}. Make sure the backend server is running and MongoDB is connected.`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new ApiError(data.message || 'Request failed. Please try again.', response.status);
  }

  return data as T;
}

const mapUser = (user: BackendUser): AppUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

export const mapProduct = (product: any): Product => ({
  id: product._id || product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  category: product.category,
  image_url: product.imageUrl || product.image_url || '',
  stock: product.stock,
  rating: product.rating || 0,
  review_count: product.reviewCount || product.review_count || 0,
  created_at: product.createdAt || product.created_at || '',
  updated_at: product.updatedAt || product.updated_at || '',
});

const mapCartItem = (item: any): CartItem => ({
  id: item._id || item.id,
  user_id: '',
  product_id: item.product?._id || item.product?.id || item.product_id,
  quantity: item.quantity,
  created_at: item.createdAt || '',
  product: item.product ? mapProduct(item.product) : undefined,
});

const mapOrder = (order: any): Order => ({
  id: order._id || order.id,
  user_id: order.user?._id || order.user || '',
  status: order.status,
  total: order.totalPrice || order.total || 0,
  shipping_name: order.shippingAddress?.fullName || order.shipping_name || '',
  shipping_address: order.shippingAddress?.address || order.shipping_address || '',
  shipping_city: order.shippingAddress?.city || order.shipping_city || '',
  shipping_zip: order.shippingAddress?.postalCode || order.shipping_zip || '',
  created_at: order.createdAt || order.created_at || '',
  updated_at: order.updatedAt || order.updated_at || '',
  order_items: (order.orderItems || order.order_items || []).map((item: any) => ({
    id: item._id || item.id,
    order_id: order._id || order.id,
    product_id: item.product?._id || item.product || null,
    product_name: item.name || item.product_name || '',
    product_image: item.imageUrl || item.product?.imageUrl || item.product_image || '',
    quantity: item.quantity,
    price: item.price,
    created_at: item.createdAt || '',
  })),
});

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: BackendUser }>('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ name, email, password }),
    });
    tokenStore.set(data.token);
    return { token: data.token, user: mapUser(data.user) };
  },
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ token: string; user: BackendUser }>('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    tokenStore.set(data.token);
    return { token: data.token, user: mapUser(data.user) };
  },
  me: async () => {
    const data = await apiRequest<{ user: BackendUser }>('/auth/me');
    return mapUser(data.user);
  },
};

export const productsApi = {
  list: async (params: URLSearchParams) => {
    const query = params.toString();
    const data = await apiRequest<{ products: any[] }>(`/products${query ? `?${query}` : ''}`, { auth: false });
    return data.products.map(mapProduct);
  },
  get: async (id: string) => {
    const data = await apiRequest<{ product: any }>(`/products/${id}`, { auth: false });
    return mapProduct(data.product);
  },
  create: async (product: {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
  }) => {
    const data = await apiRequest<{ product: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return mapProduct(data.product);
  },
  update: async (id: string, product: {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
  }) => {
    const data = await apiRequest<{ product: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return mapProduct(data.product);
  },
  delete: async (id: string) => {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
  },
};

export const cartApi = {
  get: async () => {
    const data = await apiRequest<{ cart: any[] }>('/cart');
    return data.cart.map(mapCartItem);
  },
  add: async (productId: string, quantity: number) => {
    await apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },
  update: async (itemId: string, quantity: number) => {
    await apiRequest(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },
  remove: async (itemId: string) => {
    await apiRequest(`/cart/${itemId}`, { method: 'DELETE' });
  },
  clear: async () => {
    await apiRequest('/cart', { method: 'DELETE' });
  },
};

export const ordersApi = {
  create: async (payload: {
    orderItems: { product: string; quantity: number }[];
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
    };
    paymentMethod: 'card';
  }) => {
    const data = await apiRequest<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapOrder(data.order);
  },
  myOrders: async () => {
    const data = await apiRequest<{ orders: any[] }>('/orders/myorders');
    return data.orders.map(mapOrder);
  },
  all: async () => {
    const data = await apiRequest<{ orders: any[] }>('/orders');
    return data.orders.map(mapOrder);
  },
};
