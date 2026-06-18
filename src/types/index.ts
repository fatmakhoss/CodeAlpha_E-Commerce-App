export interface Profile {
  id: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface CheckoutFormData {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image_url: string;
  stock: string;
}
