"use client";

import React from "react";

interface PillTabProps {
  label: string;
  size?: "xs" | "sm" | "md";
  icon?: React.ReactNode;
  showIcon?: boolean;
  color?: string;  // Category-specific background color
  onDismiss?: (e?: React.MouseEvent) => void;
}

const sizeStyles = {
  xs: {
    height: "22px",
    fontSize: "13px",
    iconSize: 12,
  },
  sm: {
    height: "24px",
    fontSize: "14px",
    iconSize: 13,
  },
  md: {
    height: "26px",
    fontSize: "15px",
    iconSize: 14,
  },
};

// Light colors that need black text
const lightColors = ["#00d973", "#1ebe53", "#00d9d9", "#ffadd2", "#df91f2", "#7db4ff", "#ffe600"];

export default function PillTab({
  label,
  size = "sm",
  icon,
  showIcon = false,
  color,
  onDismiss,
}: PillTabProps) {
  const styles = sizeStyles[size];
  const textColor = color && lightColors.includes(color.toLowerCase()) ? "black" : "white";

  return (
    <div
      className="inline-flex items-center gap-1 font-mono"
      style={{
        height: styles.height,
        backgroundColor: color || "#195eff",
        color: textColor,
        borderRadius: "4px",
        padding: "4px 6px",
        fontSize: styles.fontSize,
      }}
    >
      {showIcon && icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="whitespace-nowrap lowercase">{label}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => onDismiss(e)}
          className="flex-shrink-0 ml-0.5 hover:opacity-80 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          <svg
            width={styles.iconSize}
            height={styles.iconSize}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 3L3 9M3 3L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
