import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

/**
 * Guards a set of routes. By default just requires a logged-in user;
 * pass requireAdmin to also require user.role === 'admin'.
 */
export default function ProtectedRoute({
  fallback = <DefaultFallback />,
  // FIX: this had no default. If a caller forgot to pass it, an
  // unauthenticated user would silently see a blank page instead of being
  // sent anywhere — now it falls back to a redirect to /login.
  unauthenticatedElement = <Navigate to="/login" replace />,
  requireAdmin = false,
}) {
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return unauthenticatedElement;
  }

  return <Outlet />;
}