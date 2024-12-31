import { Navigate } from "react-router";
import { useAuth } from "../store/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireUnauth?: boolean;
  redirectPath?: string;
}

const ProtectedRoute = ({ children, requireAuth = false, requireUnauth = false, redirectPath }: ProtectedRouteProps) => {
  const { accessToken } = useAuth();

  // Redirect if authentication is required but the user is not authenticated
  if (requireAuth && !accessToken) {
    return <Navigate to={redirectPath || "/signin"} replace />;
  }

  // Redirect if the route requires the user to be unauthenticated but they are authenticated
  if (requireUnauth && accessToken) {
    return <Navigate to={redirectPath || "/home"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;