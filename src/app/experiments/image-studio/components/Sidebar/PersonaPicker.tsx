"use client";

import Image from "next/image";
import type { Persona } from "../../types";
import { mockPersonas } from "../../data";

interface PersonaPickerProps {
  selectedPersona: Persona | null;
  onSelect: (persona: Persona) => void;
  onBrowse: () => void;
}

export default function PersonaPicker({
  selectedPersona,
  onSelect,
  onBrowse,
}: PersonaPickerProps) {
  return (
    <div className="mb-6">
      {/* Section Title */}
      <h3
        className="text-base font-medium mb-3"
        style={{ color: "var(--color-on-surface)" }}
      >
        Select Persona
      </h3>

      {/* Horizontal Scrollable Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {/* Browse Button */}
        <button
          onClick={onBrowse}
          className="flex flex-col items-center shrink-0 group"
        >
          <div
            className="w-[70px] h-[70px] rounded-lg flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "var(--color-surface-variant)",
              border: "2px dashed var(--color-outline)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <span
            className="text-xs mt-1.5 text-center"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Browse
          </span>
        </button>

        {/* Persona Cards */}
        {mockPersonas.map((persona) => {
          const isSelected = selectedPersona?.id === persona.id;

          return (
            <button
              key={persona.id}
              onClick={() => onSelect(persona)}
              className="flex flex-col items-center shrink-0 group"
            >
              <div className="relative">
                {/* Avatar Image */}
                <div
                  className="w-[70px] h-[70px] rounded-lg overflow-hidden transition-all"
                  style={{
                    border: isSelected
                      ? "2px solid #195eff"
                      : "2px solid transparent",
                  }}
                >
                  <Image
                    src={persona.avatar}
                    alt={persona.name}
                    width={70}
                    height={70}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#195eff" }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Name */}
              <span
                className="text-xs mt-1.5 text-center truncate max-w-[70px]"
                style={{
                  color: isSelected
                    ? "var(--color-on-surface)"
                    : "var(--color-on-surface-variant)",
                }}
              >
                {persona.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
