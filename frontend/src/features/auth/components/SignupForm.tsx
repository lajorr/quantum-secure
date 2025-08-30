import { CircularProgress } from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import qs from "../../../assets/qs.jpg";
import { validatePassword, validateEmail } from "../../../shared/utils/validation";
import { checkVerificationStatus } from "../services/authService";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasPasswordError, setHasPasswordError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForVerification, setIsWaitingForVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const authContext = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (confirmPassword !== password) {
      setHasPasswordError(true);
    } else {
      setHasPasswordError(false);
    }
  }, [confirmPassword, password]);

  useEffect(() => {
    const msg = authContext.errorMessage;
    if (!msg) return;
    const validationSnippets = [
      "Enter a valid email",
      "Password must be at least",
      "Passwords do not match",
      "Password is required",
      "Email is required",
      "Username is required",
    ];
    const isValidationMessage = validationSnippets.some((s) => msg.includes(s));
    if (isValidationMessage) return; // show inline, skip toast for validation
    toast.error(msg);
  }, [authContext.errorMessage]);

  // Poll for verification status when waiting for verification
  useEffect(() => {
    if (!isWaitingForVerification || !userEmail) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await checkVerificationStatus(userEmail);
        if (response.isVerified) {
          toast.success("Email verified successfully! Redirecting to login...");
          clearInterval(pollInterval);
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        // Silently fail during polling, don't spam user with errors
        console.log("Polling verification status...");
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(pollInterval);
  }, [isWaitingForVerification, userEmail, navigate]);

  const validateInput = (
    usernameValue: string,
    emailValue: string,
    passwordValue: string,
    cPassValue: string
  ) => {
    const validationErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};

    if (!usernameValue.trim()) {
      validationErrors.name = "Username is required";
    }

    const emailErr = validateEmail(emailValue.trim());
    if (emailErr) validationErrors.email = emailErr;

    const pwErr = validatePassword(passwordValue.trim());
    if (!passwordValue.trim()) {
      validationErrors.password = "Password is required";
    } else if (pwErr) {
      validationErrors.password = pwErr;
    }

    if (!cPassValue.trim()) {
      validationErrors.confirmPassword = "Confirm Password is required";
    } else if (passwordValue !== cPassValue) {
      validationErrors.confirmPassword = "Passwords do not match";
    }

    return validationErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const foundErrors = validateInput(name, email, password, confirmPassword);
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    setIsLoading(true);
    if (password === confirmPassword) {
      try {
        const response = await authContext.signup(name, email, password);
        if (response) {
          setUserEmail(email);
          setIsWaitingForVerification(true);
          toast.success("Account created successfully! Please check your email to verify your account.");
        }
      } catch (error) {
        console.error("Signup failed:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Passwords do not match");
    }
  };

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCheckVerification = async () => {
    try {
      const response = await checkVerificationStatus(userEmail);
      if (response.isVerified) {
        toast.success("Email verified successfully! You can now log in.");
        navigate("/login");
      } else {
        toast.info("Email not verified yet. Please check your email and click the verification link.");
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      toast.error("Error checking verification status. Please try again.");
    }
  };

  const resendVerificationEmail = async () => {
    try {
      // You can implement resend verification email functionality here
      toast.info("Verification email resent! Please check your inbox.");
    } catch (error) {
      console.error("Error resending verification email:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Visual Section */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-teal-900 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Logo and Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
          <div className="flex flex-col items-center space-y-6 mb-8">
            <img src={qs} alt="Quantum Secure" className="h-24 w-24 rounded-xl shadow-lg" />
            <span className="text-white text-3xl font-bold">Quantum Secure</span>
          </div>
          
          <div className="text-white text-center">
            <h1 className="text-4xl font-bold mb-4">Join the Future</h1>
            <p className="text-xl text-white/80 mb-8">Create your account and experience quantum-secure messaging</p>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-teal-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 lg:w-3/5 bg-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold">
                Log in
              </Link>
            </p>
          </div>

          {/* Verification Waiting State */}
          {isWaitingForVerification ? (
            <div className="text-center space-y-6">
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                <div className="text-blue-400 text-6xl mb-4">📧</div>
                <h3 className="text-xl font-semibold text-white mb-2">Check Your Email</h3>
                <p className="text-gray-300 mb-4">
                  We've sent a verification link to <span className="text-blue-400 font-semibold">{userEmail}</span>
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Please click the link in your email to verify your account and complete the signup process.
                </p>
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleCheckVerification}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    I've Verified My Email
                  </button>
                  
                  <button
                    type="button"
                    onClick={resendVerificationEmail}
                    className="w-full bg-gray-700 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Resend Verification Email
                  </button>
                </div>
              </div>
              
              <div className="text-gray-400 text-sm">
                <p>Didn't receive the email? Check your spam folder or</p>
                <button
                  type="button"
                  onClick={() => setIsWaitingForVerification(false)}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  try a different email address
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Username field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="name"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-gray-400 transition-all ${
                  errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-teal-500"
                }`}
                placeholder="Enter your username"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError("name");
                }}
                required
                aria-invalid={!!errors.name}
                aria-describedby="name-error"
              />
              {errors.name && (
                <p id="name-error" className="text-red-400 text-sm mt-2">
                  {errors.name}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-gray-400 transition-all ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-teal-500"
                }`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                required
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
              {errors.email && (
                <p id="email-error" className="text-red-400 text-sm mt-2">
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-gray-400 transition-all ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-teal-500"
                }`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                required
                aria-invalid={!!errors.password}
                aria-describedby="password-error"
              />
              {errors.password && (
                <p id="password-error" className="text-red-400 text-sm mt-2">
                  {errors.password}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-gray-400 transition-all ${
                  hasPasswordError ? "border-red-500 focus:ring-red-500" : errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-700 focus:ring-teal-500"
                }`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError("confirmPassword");
                }}
                required
                aria-invalid={!!(hasPasswordError || errors.confirmPassword)}
                aria-describedby="confirmPassword-error"
              />
              {(hasPasswordError || errors.confirmPassword) && (
                <p id="confirmPassword-error" className="text-red-400 text-sm mt-2">
                  {errors.confirmPassword || "Passwords do not match"}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <CircularProgress size={20} color="inherit" className="mr-2" />
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
