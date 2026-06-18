import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { CartItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<{ error: string | null }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) { setCartItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (!error && data) setCartItems(data as CartItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) return { error: 'Please sign in to add items to cart' };

    const existing = cartItems.find(i => i.product_id === productId);
    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ product_id: productId, quantity, user_id: user.id });
      if (error) return { error: error.message };
    }
    await fetchCart();
    return { error: null };
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) { await removeFromCart(itemId); return; }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    await fetchCart();
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refetchCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
