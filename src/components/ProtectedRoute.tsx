import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
