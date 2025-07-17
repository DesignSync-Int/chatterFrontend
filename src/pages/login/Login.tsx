import { useAuthStore } from '../../store/auth.store.ts';
import { useState } from 'react';
import usePageStore from '../../store/page.store.ts';
import useUserStore from '../../store/user.store.ts';
import type { User } from '../../types/auth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isUserLoggedOut, clearLogoutFlag } from "../../utils/sessionCleanup";
import {
  validateForm,
  loginSchema,
  signupSchema,
} from "../../utils/validation";
import Captcha from "../../components/ui/Captcha";

const Login = () => {
  const { login, isLoggingIn, checkUser, signup } = useAuthStore();
  const setCurrentPage = usePageStore((state) => state.setCurrentPage);
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  // tab state - controls whether we show login or signup form
  const [isSignupTab, setIsSignupTab] = useState(false);

  // login form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // signup form states - includes the new optional fields
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupVerifyPassword, setSignupVerifyPassword] = useState("");
  const [signupProfile, setSignupProfile] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupGender, setSignupGender] = useState("");
  const [signupDateOfBirth, setSignupDateOfBirth] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  // captcha state
  const [captchaValue, setCaptchaValue] = useState("");
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0); // To force captcha refresh

  // Reset captcha function
  const resetCaptcha = () => {
    setCaptchaValue("");
    setIsCaptchaVerified(false);
    setCaptchaKey((prev) => prev + 1); // Force re-render of captcha component
  };

  // login form handler
  const handleLogin = () => {
    setErrorMessage("");
    setLoginErrors({});

    // run validation first
    const validation = validateForm(loginSchema, { name: username, password });
    if (!validation.isValid) {
      setLoginErrors(validation.errors);
      return;
    }

    login({
      name: username,
      password,
    })
      .then((user: User | null) => {
        if (user) {
          console.log("Logged in successfully");
          setCurrentPage("home");
          navigate("/home");
          setCurrentUser(user);
        } else {
          setErrorMessage("Invalid username or password");
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || "Login failed";
        if (error.response?.data?.requiresEmailVerification) {
          setErrorMessage(
            `${errorMessage} Please check your email for the verification link.`
          );
        } else {
          setErrorMessage(errorMessage);
        }
      });
  };

  const handleSignup = () => {
    setErrorMessage("");
    setSignupError("");
    setSignupErrors({});
    setIsSigningUp(true);

    // Prepare signup data
    const signupData: any = {
      name: signupName,
      password: signupPassword,
      verifyPassword: signupVerifyPassword,
      fullName: signupFullName, // Required field
      email: signupEmail, // Email is now required
      captcha: captchaValue, // Add captcha to validation
    };

    if (signupProfile && signupProfile.trim()) {
      signupData.profile = signupProfile.trim();
    }

    // Add optional fields if provided
    if (signupGender) {
      signupData.gender = signupGender;
    }
    if (signupDateOfBirth) {
      signupData.dateOfBirth = signupDateOfBirth;
    }

    // Validate signup form (including captcha)
    const validation = validateForm(signupSchema, signupData);
    if (!validation.isValid) {
      setSignupErrors(validation.errors);
      setIsSigningUp(false);
      return;
    }

    // Check if captcha is verified
    if (!isCaptchaVerified) {
      setSignupErrors({ captcha: "Please complete the captcha verification" });
      setIsSigningUp(false);
      return;
    }

    // Prepare clean data for backend (without verifyPassword)
    const backendSignupData: any = {
      name: signupName,
      password: signupPassword,
      fullName: signupFullName,
      email: signupEmail, // Email is now required
      captchaCompleted: isCaptchaVerified, // Add captcha completion status
    };

    if (signupProfile && signupProfile.trim()) {
      backendSignupData.profile = signupProfile.trim();
    }

    // Add optional fields if provided
    if (signupGender) {
      backendSignupData.gender = signupGender;
    }
    if (signupDateOfBirth) {
      backendSignupData.dateOfBirth = signupDateOfBirth;
    }

    if (signupProfile && signupProfile.trim()) {
      console.log("Signup with profile:", backendSignupData);
    } else {
      console.log(
        "Signup without profile (will use random avatar):",
        backendSignupData
      );
    }

    signup(backendSignupData)
      .then((user: User | null) => {
        if (user) {
          console.log("Signup successful, user:", user);
          // Don't redirect to home - user needs to verify email first
          setSignupError(""); // Clear any previous errors
          setErrorMessage(
            "Account created successfully! Please check your email and verify your account before logging in."
          );
          setIsSignupTab(false); // Switch to login tab
        } else {
          setErrorMessage("Signup failed. Please try again.");
        }
        setIsSigningUp(false);
      })
      .catch((error) => {
        console.error("Signup error:", error);
        setErrorMessage(error.response?.data?.message || "Signup failed");
        setSignupError(error.response?.data?.message || "Signup failed");
        setIsSigningUp(false);
        // Reset captcha on error
        resetCaptcha();
      });
  };

  useEffect(() => {
    // Check if user just logged out
    if (isUserLoggedOut()) {
      // Clear the flag and don't auto-check
      clearLogoutFlag();
      console.log("Skipping auto-auth check - user just logged out");
      return;
    }

    checkUser()
      .then((user: User | null) => {
        if (user) {
          console.log("Found existing session, redirecting to home");
          setCurrentUser(user);
          navigate("/home");
          setCurrentPage("home");
          useAuthStore.getState().connectSocket();
        } else {
          console.log("No existing session found");
        }
      })
      .catch((error) => {
        console.error("Auth check failed:", error);
      });
  }, [checkUser, setCurrentUser, navigate, setCurrentPage]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-center py-8 px-4 bg-gradient-to-b from-white to-gray-50 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Chatter
          </h1>
          <p className="text-gray-600 max-w-md">
            Connect back with your friends in a simple way.
          </p>
        </div>
      </div>

      <div className="p-6 flex-grow flex flex-col gap-6">
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-2 rounded-t-md font-semibold ${
              !isSignupTab
                ? "bg-white border-b-2 border-blue-500 text-blue-600"
                : "bg-gray-100 text-gray-500"
            }`}
            onClick={() => setIsSignupTab(false)}
            type="button"
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-t-md font-semibold ${
              isSignupTab
                ? "bg-white border-b-2 border-blue-500 text-blue-600"
                : "bg-gray-100 text-gray-500"
            }`}
            onClick={() => {
              setIsSignupTab(true);
              resetCaptcha(); // Reset captcha when switching to signup
            }}
            type="button"
          >
            Signup
          </button>
        </div>
        {!isSignupTab ? (
          <div className="flex flex-col gap-4">
            <form
              className="flex flex-col gap-3 w-full max-w-[800px] mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
              {errorMessage && (
                <div className="text-red-600 text-center font-medium">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Name"
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                    loginErrors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    // Clear error when user starts typing
                    if (loginErrors.name) {
                      setLoginErrors({ ...loginErrors, name: "" });
                    }
                  }}
                />
                {loginErrors.name && (
                  <div className="text-red-600 text-sm">{loginErrors.name}</div>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="Password"
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                    loginErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear error when user starts typing
                    if (loginErrors.password) {
                      setLoginErrors({ ...loginErrors, password: "" });
                    }
                  }}
                />
                {loginErrors.password && (
                  <div className="text-red-600 text-sm">
                    {loginErrors.password}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className={`bg-blue-500 text-white rounded-md py-2 transition w-full ${
                  isLoggingIn
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <form
              className="flex flex-col gap-3 w-full max-w-[800px] mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                handleSignup();
              }}
            >
              {signupError && (
                <div className="text-red-600 text-center font-medium">
                  {signupError}
                </div>
              )}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Username"
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                    signupErrors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  id="signup-name"
                  value={signupName}
                  onChange={(e) => {
                    setSignupName(e.target.value);
                    // Clear error when user starts typing
                    if (signupErrors.name) {
                      setSignupErrors({ ...signupErrors, name: "" });
                    }
                  }}
                />
                {signupErrors.name && (
                  <div className="text-red-600 text-sm">
                    {signupErrors.name}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Full Name"
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                    signupErrors.fullName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  id="signup-fullname"
                  value={signupFullName}
                  onChange={(e) => {
                    setSignupFullName(e.target.value);
                    // Clear error when user starts typing
                    if (signupErrors.fullName) {
                      setSignupErrors({ ...signupErrors, fullName: "" });
                    }
                  }}
                />
                {signupErrors.fullName && (
                  <div className="text-red-600 text-sm">
                    {signupErrors.fullName}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="Password"
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                    signupErrors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  id="signup-password"
                  value={signupPassword}
                  onChange={(e) => {
                    setSignupPassword(e.target.value);
                    // Clear error when user starts typing
                    if (signupErrors.password) {
                      setSignupErrors({ ...signupErrors, password: "" });
                    }
                  }}
                />
                {signupErrors.password && (
                  <div className="text-red-600 text-sm">
                    {signupErrors.password}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="Verify Password"
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                    signupErrors.verifyPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  id="signup-verify-password"
                  value={signupVerifyPassword}
                  onChange={(e) => {
                    setSignupVerifyPassword(e.target.value);
                    // Clear error when user starts typing
                    if (signupErrors.verifyPassword) {
                      setSignupErrors({ ...signupErrors, verifyPassword: "" });
                    }
                  }}
                />
                {signupErrors.verifyPassword && (
                  <div className="text-red-600 text-sm">
                    {signupErrors.verifyPassword}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Profile (Optional - leave blank for random avatar)"
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                    signupErrors.profile
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  id="signup-profile"
                  value={signupProfile}
                  onChange={(e) => {
                    setSignupProfile(e.target.value);
                    // Clear error when user starts typing
                    if (signupErrors.profile) {
                      setSignupErrors({ ...signupErrors, profile: "" });
                    }
                  }}
                />
                {signupErrors.profile && (
                  <div className="text-red-600 text-sm">
                    {signupErrors.profile}
                  </div>
                )}
              </div>

              {/* Email field - now required */}
              <div className="space-y-1">
                <input
                  type="email"
                  placeholder="Email Address *"
                  className={`border rounded-md p-2 focus:outline-none focus:ring-2 w-full ${
                    signupErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  id="signup-email"
                  value={signupEmail}
                  onChange={(e) => {
                    setSignupEmail(e.target.value);
                    // Clear error when user starts typing
                    if (signupErrors.email) {
                      setSignupErrors({ ...signupErrors, email: "" });
                    }
                  }}
                  required
                />
                {signupErrors.email && (
                  <div className="text-red-600 text-sm">
                    {signupErrors.email}
                  </div>
                )}
              </div>

              {/* Captcha Section */}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Security Verification
                </p>
                <Captcha
                  key={captchaKey}
                  onVerify={(isValid) => {
                    setIsCaptchaVerified(isValid);
                    // Clear captcha error when user interacts with captcha
                    if (signupErrors.captcha) {
                      setSignupErrors({ ...signupErrors, captcha: "" });
                    }
                  }}
                  onCaptchaChange={(value) => {
                    setCaptchaValue(value);
                    // Clear captcha error when user starts typing
                    if (signupErrors.captcha) {
                      setSignupErrors({ ...signupErrors, captcha: "" });
                    }
                  }}
                  error={signupErrors.captcha}
                />
              </div>

              {/* Optional fields section */}
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Optional Information (can be added later)
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <select
                      className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                      value={signupGender}
                      onChange={(e) => setSignupGender(e.target.value)}
                    >
                      <option value="">Select Gender (Optional)</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="date"
                      placeholder="Date of Birth (Optional)"
                      className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                      value={signupDateOfBirth}
                      onChange={(e) => setSignupDateOfBirth(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSigningUp}
                className={`bg-blue-500 text-white rounded-md py-2 transition w-full ${
                  isSigningUp
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
              >
                {isSigningUp ? "Signing up..." : "Signup"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
