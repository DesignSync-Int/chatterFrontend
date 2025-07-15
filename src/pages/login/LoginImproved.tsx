import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import usePageStore from '../../store/page.store';
import useUserStore from '../../store/user.store';
import { useForm } from '../../hooks/useForm';
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from '../../utils/validation';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from '../../utils/toast.tsx';

const LoginPage: React.FC = () => {
  const { login, signup, checkUser } = useAuthStore();
  const setCurrentPage = usePageStore((state) => state.setCurrentPage);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const navigate = useNavigate();
  const [isSignupMode, setIsSignupMode] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Login form
  const loginForm = useForm<LoginFormData>({
    schema: loginSchema,
    initialValues: { name: '', password: '' },
    onSubmit: async (data) => {
      try {
        const user = await login(data);
        if (user) {
          setCurrentUser(user);
          setCurrentPage('home');
          navigate('/home');
          toast.success('Welcome back!', { title: 'Login successful' });
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed. Please try again.';
        toast.error(message, { title: 'Login failed' });
      }
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormData>({
    schema: signupSchema,
    initialValues: { name: '', password: '', profile: '' },
    onSubmit: async (data) => {
      try {
        // Only include profile if it's not empty
        const signupData: any = {
          name: data.name,
          password: data.password,
        };

        if (data.profile && data.profile.trim()) {
          signupData.profile = data.profile.trim();
        }

        const user = await signup(signupData);
        if (user) {
          setCurrentUser(user);
          setCurrentPage("home");
          navigate("/home");
          toast.success("Account created successfully!", {
            title: "Welcome to Chatter",
          });
        }
      } catch (error: any) {
        const message = error.response?.data?.message || 'Signup failed. Please try again.';
        toast.error(message, { title: 'Signup failed' });
      }
    },
  });

  const currentForm = isSignupMode ? signupForm : loginForm;

  // Check for existing session
  useEffect(() => {
    const justLoggedOut = sessionStorage.getItem('justLoggedOut');
    
    if (justLoggedOut) {
      sessionStorage.removeItem('justLoggedOut');
      return;
    }

    checkUser()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          navigate('/home');
          setCurrentPage('home');
          useAuthStore.getState().connectSocket();
        }
      })
      .catch((error) => {
        console.error('Auth check failed:', error);
      });
  }, [checkUser, setCurrentUser, navigate, setCurrentPage]);

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    loginForm.reset();
    signupForm.reset();
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Chatter</h1>
          <p className="text-gray-600">
            {isSignupMode
              ? "Create your account"
              : "Welcome back! Please sign in."}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <form onSubmit={currentForm.handleSubmit} className="space-y-4">
            {/* Name field */}
            <Input
              name="name"
              type="text"
              label={isSignupMode ? "Full Name" : "Username"}
              placeholder={
                isSignupMode ? "Enter your full name" : "Enter your username"
              }
              value={currentForm.values.name}
              onChange={currentForm.handleChange}
              error={currentForm.errors.name}
              startIcon={<User className="h-4 w-4" />}
              data-testid="name-input"
              required
            />

            {/* Profile field (signup only) */}
            {isSignupMode && (
              <Input
                name="profile"
                type="text"
                label="Profile (Optional)"
                placeholder="Leave blank for random avatar"
                value={signupForm.values.profile}
                onChange={signupForm.handleChange}
                error={signupForm.errors.profile}
                data-testid="profile-input"
              />
            )}

            {/* Password field */}
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder={
                isSignupMode
                  ? "Create a strong password"
                  : "Enter your password"
              }
              value={currentForm.values.password}
              onChange={currentForm.handleChange}
              error={currentForm.errors.password}
              startIcon={<Lock className="h-4 w-4" />}
              data-testid="password-input"
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              helper={
                isSignupMode
                  ? "Password must be at least 8 characters with uppercase, lowercase, and number"
                  : undefined
              }
              required
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={currentForm.isSubmitting}
            >
              {isSignupMode ? "Create Account" : "Sign In"}
            </Button>
          </form>

          {/* Mode Toggle */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              {isSignupMode
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                {isSignupMode ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Connect with your friends in a simple way</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
