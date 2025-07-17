import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Phone, Mail, Clock, User } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

interface BuyFormData {
  name: string;
  contactNumber: string;
  email: string;
  bestTimeToCall: string;
  description: string;
}

const FloatingBuyButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BuyFormData>({
    name: "",
    contactNumber: "",
    email: "",
    bestTimeToCall: "",
    description: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rateLimitInfo, setRateLimitInfo] = useState({
    attempts: 0,
    lastAttempt: 0,
    isBlocked: false,
    blockUntil: 0,
  });

  // Rate limiting configuration
  const RATE_LIMIT_CONFIG = {
    maxAttempts: 3,
    timeWindow: 15 * 60 * 1000, // 15 minutes
    blockDuration: 30 * 60 * 1000, // 30 minutes
    cooldownBetweenAttempts: 5 * 1000, // 5 seconds between attempts
  };

  // Check rate limiting
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const rateLimitKey = "buyRequest_rateLimit";
    const storedData = localStorage.getItem(rateLimitKey);

    let currentRateLimit = rateLimitInfo;
    if (storedData) {
      try {
        currentRateLimit = JSON.parse(storedData);
      } catch (e) {
        console.error("Error parsing rate limit data:", e);
      }
    }

    // Check if currently blocked
    if (currentRateLimit.isBlocked && now < currentRateLimit.blockUntil) {
      const remainingTime = Math.ceil(
        (currentRateLimit.blockUntil - now) / 1000 / 60
      );
      setErrors({
        submit: `Too many attempts. Please wait ${remainingTime} minutes before trying again.`,
      });
      return false;
    }

    // Reset block if expired
    if (currentRateLimit.isBlocked && now >= currentRateLimit.blockUntil) {
      currentRateLimit = {
        attempts: 0,
        lastAttempt: 0,
        isBlocked: false,
        blockUntil: 0,
      };
    }

    // Check if within time window
    if (now - currentRateLimit.lastAttempt < RATE_LIMIT_CONFIG.timeWindow) {
      // Check if exceeded max attempts
      if (currentRateLimit.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
        currentRateLimit.isBlocked = true;
        currentRateLimit.blockUntil = now + RATE_LIMIT_CONFIG.blockDuration;

        localStorage.setItem(rateLimitKey, JSON.stringify(currentRateLimit));
        setRateLimitInfo(currentRateLimit);

        const remainingTime = Math.ceil(
          RATE_LIMIT_CONFIG.blockDuration / 1000 / 60
        );
        setErrors({
          submit: `Too many attempts. Please wait ${remainingTime} minutes before trying again.`,
        });
        return false;
      }

      // Check cooldown between attempts
      if (
        now - currentRateLimit.lastAttempt <
        RATE_LIMIT_CONFIG.cooldownBetweenAttempts
      ) {
        const remainingCooldown = Math.ceil(
          (RATE_LIMIT_CONFIG.cooldownBetweenAttempts -
            (now - currentRateLimit.lastAttempt)) /
            1000
        );
        setErrors({
          submit: `Please wait ${remainingCooldown} seconds before trying again.`,
        });
        return false;
      }
    } else {
      // Reset attempts if outside time window
      currentRateLimit.attempts = 0;
    }

    return true;
  };

  // Update rate limit after attempt
  const updateRateLimit = () => {
    const now = Date.now();
    const rateLimitKey = "buyRequest_rateLimit";

    const newRateLimit = {
      attempts: rateLimitInfo.attempts + 1,
      lastAttempt: now,
      isBlocked: false,
      blockUntil: 0,
    };

    localStorage.setItem(rateLimitKey, JSON.stringify(newRateLimit));
    setRateLimitInfo(newRateLimit);
  };

  // Check for buy query parameter
  useEffect(() => {
    const checkBuyQuery = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const buyParam = urlParams.get("buy");
      setShowButton(buyParam === "true");
    };

    // Check on initial load
    checkBuyQuery();

    // Listen for URL changes
    const handlePopState = () => {
      checkBuyQuery();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Please enter a valid contact number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.bestTimeToCall.trim()) {
      newErrors.bestTimeToCall = "Best time to call is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting before form validation
    if (!checkRateLimit()) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await axiosInstance.post("/buy-request", formData);
      setSubmitSuccess(true);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: "",
          contactNumber: "",
          email: "",
          bestTimeToCall: "",
          description: "",
        });
        setShowForm(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting buy request:", error);

      // Update rate limit on failed attempts
      updateRateLimit();

      setErrors({
        submit:
          error.response?.data?.message ||
          "Failed to submit request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BuyFormData, value: string) => {
    setFormData((prev: BuyFormData) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setSubmitSuccess(false);
    setErrors({});
  };

  if (!showButton) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        data-cy="floating-buy-button"
        onClick={() => setShowForm(true)}
        className="fixed top-4 right-4 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 group"
        title="Buy or Hire"
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="hidden group-hover:block whitespace-nowrap pr-2">
          Buy or Hire
        </span>
      </button>

      {/* Overlay Form */}
      {showForm && (
        <div
          data-cy="buy-form-overlay"
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Form Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Buy or Hire Request
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Purchase this application for your product or hire me for your
                  project
                </p>
              </div>
              <button
                data-cy="buy-form-close"
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  Thank you! Your request has been submitted successfully.
                </div>
              )}

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.submit}
                </div>
              )}

              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-2" />
                    Name *
                  </label>
                  <input
                    data-cy="buy-form-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your name"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Contact Number Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Contact Number *
                  </label>
                  <input
                    data-cy="buy-form-contact"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      handleInputChange("contactNumber", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.contactNumber
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your contact number"
                    disabled={isSubmitting}
                  />
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    data-cy="buy-form-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Best Time to Call Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Best Time to Call *
                  </label>
                  <select
                    data-cy="buy-form-time"
                    value={formData.bestTimeToCall}
                    onChange={(e) =>
                      handleInputChange("bestTimeToCall", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.bestTimeToCall
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select best time to call</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                    <option value="anytime">Anytime</option>
                  </select>
                  {errors.bestTimeToCall && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.bestTimeToCall}
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    data-cy="buy-form-description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Describe what you need: buy this application for your product or hire me for your project..."
                    rows={3}
                    disabled={isSubmitting}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  data-cy="buy-form-cancel"
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  data-cy="buy-form-submit"
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingBuyButton;
