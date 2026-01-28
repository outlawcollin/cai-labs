"use client";

import { ChangeEvent } from "react";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Search",
  value,
  onChange,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
        style={{ color: "var(--color-on-surface-variant)" }}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-4 rounded-lg outline-none transition-colors duration-200"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-on-surface)",
          border: "1px solid transparent",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-outline)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "transparent";
        }}
      />
      <style jsx>{`
        input::placeholder {
          color: var(--color-on-surface-variant);
        }
      `}</style>
    </div>
  );
}

export default SearchInput;
