import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2.5 rounded-lg
            bg-bg-secondary text-text-primary
            border transition-all duration-200
            placeholder:text-text-muted
            focus:outline-none focus:ring-2 focus:ring-accent/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? "border-error focus:border-error focus:ring-error/50"
                : "border-border hover:border-border-hover focus:border-accent"
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
