"use client";

import Image from "next/image";
import type { Character } from "../../types";
import { mockCharacters } from "../../data";

interface CharacterPickerProps {
  selectedCharacter: Character | null;
  onSelect: (character: Character) => void;
  onBrowse: () => void;
  label?: string;
}

export default function CharacterPicker({
  selectedCharacter,
  onSelect,
  onBrowse,
  label = "Select Character",
}: CharacterPickerProps) {
  return (
    <div className="mb-4">
      {/* Section Title */}
      <h3
        className="text-sm font-medium mb-3"
        style={{ color: "var(--color-on-surface)" }}
      >
        {label}
      </h3>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {/* Browse Button */}
        <button
          onClick={onBrowse}
          className="flex flex-col items-center shrink-0 cursor-pointer group"
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

        {/* Character Cards */}
        {mockCharacters.map((character) => {
          const isSelected = selectedCharacter?.id === character.id;

          return (
            <button
              key={character.id}
              onClick={() => onSelect(character)}
              className="flex flex-col items-center shrink-0 cursor-pointer group"
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
                    src={character.avatar}
                    alt={character.name}
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

              {/* Character Name */}
              <span
                className="text-xs mt-1.5 text-center max-w-[70px] truncate"
                style={{
                  color: isSelected
                    ? "var(--color-on-surface)"
                    : "var(--color-on-surface-variant)",
                }}
              >
                {character.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
