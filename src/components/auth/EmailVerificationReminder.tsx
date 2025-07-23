import { Mail, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import { resendVerificationEmail } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";

interface EmailVerificationReminderProps {
  email: string;
  onClose: () => void;
}

const EmailVerificationReminder: React.FC<EmailVerificationReminderProps> = ({
  email,
  onClose,
}) => {
  const [isResending, setIsResending] = useState(false);
  const authUser = useAuthStore((state) => state.authUser);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Check if user is verified and auto-close the reminder
  useEffect(() => {
    if (authUser && authUser.isEmailVerified) {
      onClose();
    }
  }, [authUser, onClose]);

  // Periodically check auth status to catch verification updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (authUser && !authUser.isEmailVerified) {
        checkAuth();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [authUser, checkAuth]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send verification email");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4 mb-6 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#FB406C]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Email Verification Required
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Please verify your email address <strong>{email}</strong> to access
            all features.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FB406C] hover:bg-[#fb406cd9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB406C] disabled:opacity-50 disabled:cursor-not-allowed ${
                isResending ? "cursor-not-allowed" : ""
              }`}
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                "Resend Verification Email"
              )}
            </button>

            <p className="text-xs text-gray-500 mt-2 sm:mt-0 sm:ml-2 self-center">
              Check your spam folder if you don't see the email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationReminder;
