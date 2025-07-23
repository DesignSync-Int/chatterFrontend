import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

import { verifyEmail as verifyEmailService } from "../../services/auth.service";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("error");
        toast.error("Invalid verification link");
        return;
      }

      try {
        await verifyEmailService(token);
        setVerificationStatus("success");
        toast.success("Email verified successfully!");
        // Redirect to login after 3 seconds
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        setVerificationStatus("error");
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to verify email");
        }
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          {verificationStatus === "verifying" && (
            <>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verifying your email
              </h2>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-t-[#FB406C] rounded-full animate-spin"></div>
              </div>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Email verified!
              </h2>
              <p className="mt-2 text-gray-600">Redirecting you to login...</p>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Verification failed
              </h2>
              <p className="mt-2 text-gray-600">Please try signing up again</p>
              <button
                onClick={() => navigate("/signup")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FB406C] hover:bg-[#fb406cd9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FB406C]"
              >
                Back to signup
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
