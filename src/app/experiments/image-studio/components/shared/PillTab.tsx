"use client";

import React from "react";

interface PillTabProps {
  label: string;
  size?: "xs" | "sm" | "md";
  icon?: React.ReactNode;
  showIcon?: boolean;
  onDismiss?: () => void;
}

const sizeStyles = {
  xs: {
    height: "20px",
    fontSize: "10px",
    iconSize: 10,
  },
  sm: {
    height: "22px",
    fontSize: "11px",
    iconSize: 11,
  },
  md: {
    height: "24px",
    fontSize: "12px",
    iconSize: 12,
  },
};

const StarIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.5L6 8.885L2.91 10.5L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
      fill="currentColor"
    />
  </svg>
);

export default function PillTab({
  label,
  size = "sm",
  icon,
  showIcon = true,
  onDismiss,
}: PillTabProps) {
  const styles = sizeStyles[size];

  return (
    <div
      className="inline-flex items-center gap-1 font-mono"
      style={{
        height: styles.height,
        backgroundColor: "#195eff",
        color: "white",
        borderRadius: "4px",
        padding: "4px 6px",
        fontSize: styles.fontSize,
      }}
    >
      {showIcon && (
        <span className="flex-shrink-0">
          {icon || <StarIcon size={styles.iconSize} />}
        </span>
      )}
      <span className="whitespace-nowrap">{label}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
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
