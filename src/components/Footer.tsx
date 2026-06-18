import { Link } from 'react-router-dom';
import { Package, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-900" />
              </div>
              <span className="font-bold text-xl text-white">ShopAlpha</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              A modern e-commerce platform built as part of the CodeAlpha Full Stack Development internship program.
            </p>
            <div className="flex gap-3 mt-4">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <div key={i} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition cursor-pointer">
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Shop</h4>
            <ul className="space-y-2 text-sm">
              {['Products', 'Electronics', 'Clothing', 'Accessories'].map(item => (
                <li key={item}>
                  <Link to={item === 'Products' ? '/products' : `/products?category=${item}`} className="hover:text-white transition">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Account</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Sign In', path: '/login' },
                { label: 'Register', path: '/register' },
                { label: 'My Orders', path: '/orders' },
                { label: 'Cart', path: '/cart' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link to={path} className="hover:text-white transition">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>© {new Date().getFullYear()} ShopAlpha — CodeAlpha Internship Project</p>
          <p>Built with React + Vite + Supabase + Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}
