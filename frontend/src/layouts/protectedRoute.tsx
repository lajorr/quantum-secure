import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, checkToken, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkToken();
    // eslint-disable-next-line
  }, []);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Only redirect if not authenticated and not loading
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return <>{children}</>;
};
