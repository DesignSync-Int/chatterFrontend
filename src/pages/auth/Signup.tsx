import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { signup } from '../../services/auth.service';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [errors, setErrors] = useState({
    email: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email address is required' }));
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    // Additional validation for minimum length
    if (email.trim().length < 5) {
      setErrors(prev => ({ ...prev, email: 'Email address is too short' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.email || !validateEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Email address is required' }));
      return;
    }

    setLoading(true);
    try {
      const response = await signup({
        ...formData,
        captchaCompleted: true,
      });
      
      toast.success(response.message || 'Please check your email to verify your account');
      navigate('/login');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Chatter
          </h1>
          <p className="text-gray-600 max-w-md">
            Join our community and start connecting with friends. Or sign in if
            you already have an account.
          </p>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-6">
        <div className="flex flex-col gap-4 max-w-[400px] mx-auto w-full">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                className="border rounded-md p-2 focus:outline-none focus:ring-2 w-full border-gray-300 focus:ring-[#FB406C]"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email address (required)"
                className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-[#FB406C]"
                }`}
                id="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  validateEmail(e.target.value);
                }}
                onBlur={(e) => validateEmail(e.target.value)}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Your full name"
                className="border rounded-md p-2 focus:outline-none focus:ring-2 w-full border-gray-300 focus:ring-[#FB406C]"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="border rounded-md p-2 focus:outline-none focus:ring-2 w-full border-gray-300 focus:ring-[#FB406C]"
                id="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!errors.email}
              className={`bg-[#FB406C] text-white rounded-md py-2 transition w-full ${
                loading || !!errors.email
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[#fb406cd9]"
              }`}
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>

            <div className="flex justify-between items-center mt-4 text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#FB406C] hover:text-[#fb406cd9] font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
