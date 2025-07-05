import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, checkToken, authLoading } = useAuth();
  const navigate = useNavigate();
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(false);

  useEffect(() => {
    // Wait for initial auth loading to complete
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated && !hasCheckedToken && !isCheckingToken) {
      setHasCheckedToken(true);
      setIsCheckingToken(true);
      
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setIsCheckingToken(false);
      }, 200); // Reduced to 3 seconds

      checkToken()
        .finally(() => {
          clearTimeout(timeoutId);
          setIsCheckingToken(false);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          setIsCheckingToken(false);
          // If checkToken fails, it will handle logout internally
        });
    }
  }, [
    isAuthenticated,
    authLoading,
    checkToken,
    hasCheckedToken,
    isCheckingToken,
  ]);

  // Redirect to login only if we've checked the token and still not authenticated
  useEffect(() => {
    // Only redirect if we've completed the token check and still not authenticated
    if (!authLoading && !isCheckingToken && hasCheckedToken && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isCheckingToken, hasCheckedToken, isAuthenticated, navigate]);

  // Show loading spinner while checking authentication or during initial auth loading
  if (authLoading || isCheckingToken) {
    return (
      <div className="h-screen w-screen bg-gray-200 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Only show children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
