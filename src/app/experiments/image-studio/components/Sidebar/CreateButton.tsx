"use client";

import React from "react";

interface CreateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
  creditCost?: number;
}

export default function CreateButton({
  onClick,
  disabled = false,
  isGenerating = false,
  creditCost = 50,
}: CreateButtonProps) {
  const isDisabled = disabled || isGenerating;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative flex w-full items-center justify-center gap-3
        h-[52px] rounded-full
        bg-[#195eff] text-white font-medium
        transition-all duration-200
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:brightness-110 active:brightness-95"}
      `}
    >
      {/* Button text */}
      <span className="text-base">
        {isGenerating ? "Shooting" : "Shoot it"}
      </span>

      {/* Spinner when generating */}
      {isGenerating && (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}

      {/* Credit badge when not generating */}
      {!isGenerating && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20">
          {/* Credit icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <circle
              cx="7"
              cy="7"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M7 4V7L9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs font-medium">{creditCost}</span>
        </div>
      )}
    </button>
  );
}
