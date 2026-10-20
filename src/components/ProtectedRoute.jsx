import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Skeleton className="h-40 w-full" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
