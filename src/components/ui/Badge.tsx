import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "default" | "success" | "error" | "warning" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-card text-text-secondary border-border",
  success: "bg-success/10 text-success border-success/20",
  error: "bg-error/10 text-error border-error/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-accent/10 text-accent border-accent/20",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}
