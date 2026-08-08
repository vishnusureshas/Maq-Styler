import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export function ProtectedRoute({ roles }: { roles?: ('user' | 'admin')[] }) {
  const { token, user } = useAppSelector((s) => s.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}