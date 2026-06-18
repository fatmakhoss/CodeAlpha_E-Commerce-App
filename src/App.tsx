import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductFormPage from './pages/admin/ProductFormPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Auth pages (no nav/footer) */}
            <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><RegisterPage /></AuthLayout>} />

            {/* Main pages */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/cart" element={<Layout><CartPage /></Layout>} />

            {/* Protected user routes */}
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Layout><CheckoutPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout><OrdersPage /></Layout>
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products/new" element={
              <ProtectedRoute adminOnly>
                <Layout><ProductFormPage /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/products/:id/edit" element={
              <ProtectedRoute adminOnly>
                <Layout><ProductFormPage /></Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
