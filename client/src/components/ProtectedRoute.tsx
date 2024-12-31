import { Navigate } from "react-router";
import { useAuth } from "../store/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireUnauth?: boolean;
  redirectPath?: string;
}

const ProtectedRoute = ({ children, requireAuth = false, requireUnauth = false, redirectPath }: ProtectedRouteProps) => {
  const { accessToken, hasJustRegistered } = useAuth();
  
  // Allow access to signup if user has just registered
  if (hasJustRegistered && window.location.pathname === "/signup") {
    return <>{children}</>;
  }

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !accessToken) {
    return <Navigate to={redirectPath || "/signin"} replace />;
  }

  // Redirect if the route requires user to be unauthenticated but they are authenticated
  if (requireUnauth && accessToken && !hasJustRegistered) {
    return <Navigate to={redirectPath || "/home"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;