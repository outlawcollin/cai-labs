"use client";

import { ImageMode } from "../../types";

interface ModeSelectorProps {
  mode: ImageMode;
  onModeChange: (mode: ImageMode) => void;
}

interface ModeOption {
  id: ImageMode;
  label: string;
  subtitle: string;
}

const MODE_OPTIONS: ModeOption[] = [
  { id: "self-portrait", label: "Self-portrait", subtitle: "Just your persona" },
  { id: "solo", label: "Solo", subtitle: "Just a character" },
  { id: "together", label: "Together", subtitle: "You and a character" },
  { id: "duo", label: "Duo", subtitle: "Two characters" },
];

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {MODE_OPTIONS.map((option) => {
        const isSelected = mode === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onModeChange(option.id)}
            className="relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 cursor-pointer transition-all"
            style={{
              backgroundColor: "var(--color-surface-variant)",
              border: isSelected ? "2px solid #195eff" : "2px solid transparent",
            }}
          >
            {/* Checkmark for selected state */}
            {isSelected && (
              <div
                className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#195eff" }}
              >
                <svg
                  width="10"
                  height="8"
                  viewBox="0 0 10 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Icon placeholder */}
            <div className="w-10 h-10 rounded-full bg-gray-600 mb-2" />

            {/* Label */}
            <span
              className="text-xs font-medium text-center leading-tight"
              style={{ color: "var(--color-on-surface)" }}
            >
              {option.label}
            </span>

            {/* Subtitle */}
            <span
              className="text-[10px] text-center leading-tight mt-0.5"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              {option.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
