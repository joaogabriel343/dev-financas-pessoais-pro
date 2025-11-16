import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    // Timeout de segurança: se após 10 segundos ainda estiver loading, força redirect
    const timeout = setTimeout(() => {
      if (loading) {
        console.error('Timeout de autenticação atingido');
        setTimeoutReached(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Se atingiu timeout e ainda está loading, redireciona para auth
  if (timeoutReached && loading) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
