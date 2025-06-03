import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "accent"
    | "destructive"
    | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  className = "",
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out";

  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:scale-[1.04] hover:shadow-lg focus:ring-primary-600",
    accent:
      "bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:scale-[1.04] hover:shadow-lg focus:ring-accent-500",
    secondary:
      "bg-slate-700 text-white hover:bg-slate-700/90 focus:ring-slate-700",
    outline:
      "border border-primary-600 bg-white text-primary-700 hover:bg-primary-50 focus:ring-primary-600",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;
