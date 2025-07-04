import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, checkToken, authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("in protected route");
    (async () => {
      await checkToken();
    })();
  }, []);

  // check if the token is verified
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("failed auth");
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return <div>Loading...</div>;
  }

  // Only redirect if not authenticated and not loading
  // if (!isAuthenticated) {
  //   console.log("failed auth");
  //   // navigate('/login')
  //   return <LoginForm />;
  // }

  return <>{children}</>;
};
