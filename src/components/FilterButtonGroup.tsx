"use client";

import { useState } from "react";

interface FilterButtonGroupProps {
  options: string[];
  defaultSelected?: string;
  onSelect?: (option: string) => void;
}

export function FilterButtonGroup({
  options,
  defaultSelected,
  onSelect,
}: FilterButtonGroupProps) {
  const [selected, setSelected] = useState(defaultSelected || options[0]);

  const handleSelect = (option: string) => {
    setSelected(option);
    onSelect?.(option);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`h-11 md:h-[52px] px-4 md:px-[22px] rounded-full font-medium text-base md:text-lg whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
              isSelected ? "" : "border"
            }`}
            style={{
              backgroundColor: isSelected
                ? "var(--color-on-surface)"
                : "transparent",
              color: isSelected
                ? "var(--color-background)"
                : "var(--color-on-surface)",
              borderColor: isSelected ? "transparent" : "var(--color-outline)",
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default FilterButtonGroup;
