import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { toast as hotToast, type ToastOptions } from "react-hot-toast";

interface ToastConfig extends ToastOptions {
  title?: string;
  description?: string;
}

const createToast = (
  type: "success" | "error" | "warning" | "info",
  message: string,
  options?: ToastConfig,
) => {
  const { title, description, ...toastOptions } = options || {};

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  const Icon = icons[type];
  const colorClass = colors[type];

  return hotToast.custom(
    (t) => (
      <div
        className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ${
          t.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${colorClass}`} aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <p className="text-sm font-medium text-gray-900">{title}</p>
              )}
              <p
                className={`text-sm ${title ? "text-gray-500" : "text-gray-900"}`}
              >
                {message}
              </p>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Close notification"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    ),
    {
      duration: 4000,
      position: "top-right",
      ...toastOptions,
    },
  );
};

export const toast = {
  success: (message: string, options?: ToastConfig) =>
    createToast("success", message, options),
  error: (message: string, options?: ToastConfig) =>
    createToast("error", message, options),
  warning: (message: string, options?: ToastConfig) =>
    createToast("warning", message, options),
  info: (message: string, options?: ToastConfig) =>
    createToast("info", message, options),

  // Direct access to react-hot-toast methods
  dismiss: hotToast.dismiss,
  remove: hotToast.remove,
  loading: hotToast.loading,
  promise: hotToast.promise,
};
