"use client";

import { useMemo } from "react";
import type { OptionCategory, OptionItem } from "../../types";
import { mockOptions, categoryMeta } from "../../data";
import PillTab from "../shared/PillTab";

interface OptionsDropdownProps {
  category: OptionCategory;
  isExpanded: boolean;
  selectedOptions: OptionItem[];
  onToggle: () => void;
  onSelectOption: (option: OptionItem) => void;
  onRemoveOption: (optionId: string) => void;
}

// Category icons as simple SVG components
const CategoryIcons: Record<OptionCategory, React.ReactNode> = {
  style: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <circle cx="9" cy="18.5" r="2.5" />
      <circle cx="15" cy="18.5" r="2.5" />
    </svg>
  ),
  shot: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  scene: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3L12 7L16 3" />
      <path d="M4 14L8 10L12 14L16 10L20 14" />
      <path d="M4 21H20" />
    </svg>
  ),
  outfit: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4L8 2H16L18 4" />
      <path d="M6 4V20C6 21 7 22 8 22H16C17 22 18 21 18 20V4" />
      <path d="M6 4L4 6V10L6 8" />
      <path d="M18 4L20 6V10L18 8" />
    </svg>
  ),
  pose: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7V14" />
      <path d="M8 10L12 12L16 10" />
      <path d="M12 14L8 22" />
      <path d="M12 14L16 22" />
    </svg>
  ),
  gesture: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 11V6C18 5 17 4 16 4C15 4 14 5 14 6V11" />
      <path d="M14 10V4C14 3 13 2 12 2C11 2 10 3 10 4V11" />
      <path d="M10 10V6C10 5 9 4 8 4C7 4 6 5 6 6V14L4 12C3.5 11.5 2.5 11.5 2 12C1.5 12.5 1.5 13.5 2 14L8 20C9 21 10.5 22 13 22H15C18 22 20 20 20 17V11C20 10 19 9 18 9C17 9 16 10 16 11" />
    </svg>
  ),
  expression: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14S9.5 16 12 16S16 14 16 14" />
      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  effects: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />
      <path d="M5 3L5.5 5L7.5 5.5L5.5 6L5 8L4.5 6L2.5 5.5L4.5 5L5 3Z" />
      <path d="M19 17L19.5 19L21.5 19.5L19.5 20L19 22L18.5 20L16.5 19.5L18.5 19L19 17Z" />
    </svg>
  ),
};

export default function OptionsDropdown({
  category,
  isExpanded,
  selectedOptions,
  onToggle,
  onSelectOption,
  onRemoveOption,
}: OptionsDropdownProps) {
  const options = mockOptions[category];
  const meta = categoryMeta[category];

  // Check if an option is selected
  const isSelected = (optionId: string) => {
    return selectedOptions.some((o) => o.id === optionId);
  };

  return (
    <div
      style={{
        borderBottom: "1px solid var(--color-surface-variant)",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full py-3 flex items-center gap-2 cursor-pointer"
      >
        {/* Icon */}
        <span style={{ color: "var(--color-on-surface)" }}>
          {CategoryIcons[category]}
        </span>

        {/* Label */}
        <span
          className="flex-1 text-left text-lg"
          style={{ color: "var(--color-on-surface)" }}
        >
          {category}
        </span>

        {/* Selected pills (show first one if any) */}
        {selectedOptions.length > 0 && !isExpanded && (
          <div className="flex items-center gap-1">
            <PillTab
              label={selectedOptions[0].label}
              size="xs"
              onDismiss={() => onRemoveOption(selectedOptions[0].id)}
            />
            {selectedOptions.length > 1 && (
              <span
                className="text-xs px-1"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                +{selectedOptions.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Chevron */}
        <span
          className="transition-transform duration-200"
          style={{
            color: "var(--color-on-surface-variant)",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18L15 12L9 6" />
          </svg>
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="pb-4">
          {/* Selected pills row */}
          {selectedOptions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3 px-1">
              {selectedOptions.map((option) => (
                <PillTab
                  key={option.id}
                  label={option.label}
                  size="sm"
                  onDismiss={() => onRemoveOption(option.id)}
                />
              ))}
            </div>
          )}

          {/* Options grid */}
          <div className="grid grid-cols-5 gap-2">
            {options.map((option) => {
              const selected = isSelected(option.id);

              return (
                <button
                  key={option.id}
                  onClick={() => onSelectOption(option)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-full aspect-square rounded-lg overflow-hidden mb-1"
                    style={{
                      backgroundColor: "var(--color-surface-variant)",
                      border: selected ? "2px solid #195eff" : "2px solid transparent",
                    }}
                  >
                    {/* Placeholder for actual thumbnail */}
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {option.label.charAt(0)}
                    </div>

                    {/* Selected checkmark */}
                    {selected && (
                      <div
                        className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "#195eff" }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                        >
                          <path d="M5 12L10 17L19 8" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className="text-xs text-center truncate w-full"
                    style={{
                      color: selected
                        ? "var(--color-on-surface)"
                        : "var(--color-on-surface-variant)",
                    }}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
