import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem } from '../types';
import { useAuth } from './AuthContext';
import { cartApi } from '../lib/api';

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
    try {
      setCartItems(await cartApi.get());
    } catch {
      setCartItems([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) return { error: 'Please sign in to add items to cart' };

    try {
      await cartApi.add(productId, quantity);
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to add item to cart' };
    }
    await fetchCart();
    return { error: null };
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) { await removeFromCart(itemId); return; }
    await cartApi.update(itemId, quantity);
    await fetchCart();
  };

  const removeFromCart = async (itemId: string) => {
    await cartApi.remove(itemId);
    setCartItems(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = async () => {
    if (!user) return;
    await cartApi.clear();
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
