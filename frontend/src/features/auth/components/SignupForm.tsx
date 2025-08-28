import { CircularProgress } from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import qs from "../../../assets/qs.jpg";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasPasswordError, setHasPasswordError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
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
    if (authContext.errorMessage) {
      toast.error(authContext.errorMessage);
    }
  }, [authContext.errorMessage]);

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

    const emailRegex = new RegExp("^[^@]+@[^@]+\\.[^@]{2,}$");
    if (!emailValue.trim()) {
      validationErrors.email = "Email is required";
    } else if (!emailRegex.test(emailValue.trim())) {
      validationErrors.email = "Enter a valid email";
    }

    const passwordRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );
    if (!passwordValue.trim()) {
      validationErrors.password = "Password is required";
    } else if (!passwordRegex.test(passwordValue.trim())) {
      validationErrors.password =
        "Password must be at least 8 characters, include upper, lower, number, and symbol";
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
      const isSuccess = await authContext.signup(name, email, password);
      if (isSuccess) {
        toast.success("Account created successfully");
        navigate("/login");
      } else {
        setIsLoading(false);
        return false;
      }
      setIsLoading(false);
    } else {
      toast.error("Passwords do not match");
    }
  };

  const clearFieldError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <img className="h-40 w-40 mx-auto mb-4 rounded-xl shadow-lg" src={qs} alt="Quantum Secure Logo" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create account</h1>
          <p className="text-gray-600">Join Quantum Secure today</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="name"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.name ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
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
                <p id="name-error" className="text-red-500 text-sm mt-2">
                  {errors.name}
                </p>
              )}
            </div>
            
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
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
                <p id="email-error" className="text-red-500 text-sm mt-2">
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  errors.password ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Create a password"
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
                <p id="password-error" className="text-red-500 text-sm mt-2">
                  {errors.password}
                </p>
              )}
            </div>
            
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  hasPasswordError ? "border-red-300 focus:ring-red-500" : errors.confirmPassword ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
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
                <p id="confirmPassword-error" className="text-red-500 text-sm mt-2">
                  {errors.confirmPassword || "Passwords do not match"}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:text-blue-600 font-semibold hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
