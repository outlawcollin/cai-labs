"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonSize = "sm" | "md" | "lg";
type IconButtonVariant = "default" | "outline";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "w-8 h-8", // 32px
  md: "w-[38px] h-[38px]", // 38px
  lg: "w-12 h-12", // 48px
};

export function IconButton({
  children,
  size = "md",
  variant = "default",
  className = "",
  style,
  ...props
}: IconButtonProps) {
  const isOutline = variant === "outline";

  return (
    <button
      className={`
        flex items-center justify-center rounded-full
        transition-[filter] duration-200
        hover:brightness-110
        ${sizeClasses[size]}
        ${isOutline ? "border" : ""}
        ${className}
      `}
      style={{
        backgroundColor: isOutline ? "transparent" : "var(--color-surface-variant)",
        borderColor: isOutline ? "var(--color-outline)" : "transparent",
        color: "var(--color-on-surface)",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default IconButton;
