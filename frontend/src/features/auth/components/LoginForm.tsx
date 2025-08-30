import { CircularProgress } from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { validateEmail } from "../../../shared/utils/validation";
import ForgotPassword from "./ForgotPassword";

import qs from "../../../assets/qs.jpg";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>(() => ({}));
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const authContext = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email.trim());
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }
    setErrors({});
    setIsLoading(true);
    const isSuccess = await authContext.login(email, password);
    if (isSuccess) {
      toast.success("Logged in successfully");
      navigate("/");
    } else {
      setIsLoading(false);
      return false;
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (authContext.errorMessage) {
      toast.error(authContext.errorMessage);
    }
  }, [authContext.errorMessage]);

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
            <h1 className="text-4xl font-bold mb-4">Secure Communication</h1>
            <p className="text-xl text-white/80 mb-8">End-to-end encrypted messaging with quantum-resistant cryptography</p>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-teal-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 lg:w-3/5 bg-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold">
                Log in
              </Link>
            </p>
          </div>

          {/* Forgot Password or Login Form */}
          {showForgotPassword ? (
            <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
          ) : (
            <>
              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                  if (errors.email) setErrors({});
                }}
                required
                aria-invalid={!!errors.email}
                aria-describedby="login-email-error"
              />
              {errors.email && (
                <p id="login-email-error" className="text-red-400 text-sm mt-2">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-gray-400 transition-all"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
         
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <CircularProgress size={20} color="inherit" className="mr-2" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
            <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-teal-400 hover:text-teal-300 underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-semibold hover:underline transition-colors">
                Sign up
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
