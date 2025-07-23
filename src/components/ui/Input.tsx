import React, { memo, forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "../../utils/cn";

interface InputProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  error?: string;
  helper?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = memo(
  forwardRef<HTMLInputElement, InputProps>(
    (
      { className, label, error, helper, startIcon, endIcon, id, ...props },
      ref,
    ) => {
      const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

      return (
        <div className="w-full">
          {label && (
            <label
              htmlFor={inputId}
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              {label}
            </label>
          )}

          <div className="relative">
            {startIcon && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-400" aria-hidden="true">
                  {startIcon}
                </span>
              </div>
            )}

            <input
              ref={ref}
              id={inputId}
              className={cn(
                "block w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
                "placeholder:text-gray-400",
                "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
                "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
                startIcon && "pl-10",
                endIcon && "pr-10",
                error &&
                  "border-red-300 focus:border-red-500 focus:ring-red-500",
                className,
              )}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={
                error
                  ? `${inputId}-error`
                  : helper
                    ? `${inputId}-helper`
                    : undefined
              }
              {...props}
            />

            {endIcon && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-400" aria-hidden="true">
                  {endIcon}
                </span>
              </div>
            )}
          </div>

          {error && (
            <p
              id={`${inputId}-error`}
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          {helper && !error && (
            <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
              {helper}
            </p>
          )}
        </div>
      );
    },
  ),
);

Input.displayName = "Input";
