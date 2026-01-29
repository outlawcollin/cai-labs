"use client";

import Image from "next/image";
import type { Character } from "../../types";
import { mockCharacters } from "../../data";

interface CharacterPickerProps {
  selectedCharacter: Character | null;
  onSelect: (character: Character) => void;
  onBrowse: () => void;
  label?: string;
  isMobile?: boolean;
}

export default function CharacterPicker({
  selectedCharacter,
  onSelect,
  onBrowse,
  label = "select character",
  isMobile = false,
}: CharacterPickerProps) {
  // Build display items: selected (if any) + fill with defaults
  // Always exactly 3 items (Browse button is separate)
  const getDisplayItems = (): Character[] => {
    const defaults = mockCharacters.slice(0, 3);

    if (selectedCharacter) {
      // If selected is already in defaults, don't duplicate
      const isInDefaults = defaults.some(c => c.id === selectedCharacter.id);
      if (isInDefaults) {
        return defaults;
      }
      // Insert selected at position 0, shift others
      return [selectedCharacter, defaults[0], defaults[1]];
    }

    return defaults;
  };

  const displayItems = getDisplayItems();

  return (
    <div>
      {/* Section Title */}
      <h3
        className="text-lg font-medium mb-3"
        style={{ color: "var(--color-on-surface)" }}
      >
        {label}
      </h3>

      {/* 4-item Grid: Browse + 3 avatars */}
      <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-1`}>
        {/* Browse Button */}
        <button
          onClick={onBrowse}
          className="flex flex-col items-center cursor-pointer"
        >
          <div
            className="aspect-square w-full rounded-2xl flex items-center justify-center"
            style={{
              border: "1.5px solid color-mix(in srgb, var(--color-on-brand) 8%, transparent)",
            }}
          >
            {/* Grid/Search Icon - layout, grid, list, search, find, magifier.svg */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="var(--color-on-surface-variant)"
            >
              <path d="M11.6783 4H13.3333C14.0697 4 14.6667 4.59696 14.6667 5.33334V13.3333C14.6667 14.0697 14.0697 14.6667 13.3333 14.6667H5.33334C4.59696 14.6667 4 14.0697 4 13.3333V11.6783C3.99998 10.605 3.99997 9.71916 4.05893 8.99757C4.12016 8.2481 4.25158 7.55917 4.5813 6.91205C5.09262 5.90852 5.90852 5.09262 6.91205 4.5813C7.55917 4.25158 8.2481 4.12016 8.99757 4.05893C9.71916 3.99997 10.605 3.99998 11.6783 4Z" />
              <path d="M23.0024 4.05893C23.7519 4.12016 24.4408 4.25158 25.0879 4.5813C26.0915 5.09262 26.9074 5.90852 27.4187 6.91205C27.7484 7.55917 27.8798 8.2481 27.9411 8.99757C28 9.71916 28 10.605 28 11.6783V13.3333C28 14.0697 27.403 14.6667 26.6667 14.6667H18.6667C17.9303 14.6667 17.3333 14.0697 17.3333 13.3333V5.33334C17.3333 4.59696 17.9303 4 18.6667 4H20.3217C21.395 3.99998 22.2808 3.99997 23.0024 4.05893Z" />
              <path d="M4 18.6667C4 17.9303 4.59696 17.3333 5.33334 17.3333H13.3333C14.0697 17.3333 14.6667 17.9303 14.6667 18.6667V26.6667C14.6667 27.403 14.0697 28 13.3333 28H11.6783C10.605 28 9.71916 28 8.99757 27.9411C8.2481 27.8798 7.55917 27.7484 6.91205 27.4187C5.90852 26.9074 5.09262 26.0915 4.5813 25.0879C4.25158 24.4408 4.12016 23.7519 4.05893 23.0024C3.99997 22.2808 3.99998 21.395 4 20.3218V18.6667Z" />
              <path fillRule="evenodd" clipRule="evenodd" d="M26.4379 18.8962C24.3551 16.8134 20.9782 16.8134 18.8954 18.8962C16.8126 20.979 16.8126 24.3559 18.8954 26.4387C20.6527 28.196 23.3311 28.4706 25.3763 27.2627L27.0572 28.9436C27.5779 29.4643 28.4221 29.4643 28.9428 28.9436C29.4635 28.4229 29.4635 27.5787 28.9428 27.058L27.2619 25.3771C28.4698 23.3319 28.1951 20.6535 26.4379 18.8962ZM20.781 20.7819C21.8224 19.7405 23.5109 19.7405 24.5523 20.7819C25.5937 21.8233 25.5937 23.5117 24.5523 24.5531C23.5109 25.5945 21.8224 25.5945 20.781 24.5531C19.7396 23.5117 19.7397 21.8233 20.781 20.7819Z" />
            </svg>
          </div>
          <span
            className="text-sm font-normal mt-1 text-center"
            style={{ color: "var(--color-on-surface)" }}
          >
            browse
          </span>
        </button>

        {/* Character Items */}
        {displayItems.map((character) => {
          const isSelected = selectedCharacter?.id === character.id;

          return (
            <button
              key={character.id}
              onClick={() => onSelect(character)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="relative aspect-square w-full">
                {/* Avatar Image */}
                <div
                  className="relative w-full h-full rounded-2xl overflow-hidden"
                  style={{
                    border: isSelected
                      ? "1.5px solid #195eff"
                      : "1.5px solid color-mix(in srgb, var(--color-on-brand) 8%, transparent)",
                  }}
                >
                  <Image
                    src={character.avatar}
                    alt={character.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                    quality={90}
                  />
                </div>

                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0ZM25.8604 9.3916C25.4334 8.28717 24.1545 7.72398 23.0039 8.13379C21.2395 8.76233 19.5746 9.9508 18.1348 11.2207C15.8372 13.2471 13.8578 15.6316 12.0498 18.0977C11.5472 17.5641 11.0635 17.159 10.6074 16.8525C9.8933 16.3727 9.08834 16.032 8.22168 16C6.99463 16.0002 6 16.9558 6 18.1338C6.00015 19.1998 6.81474 20.0828 7.87891 20.2412C8.0768 20.3382 8.95217 20.8594 10.1816 22.9248C10.5722 23.5809 11.295 23.9902 12.082 24C12.8689 24.0098 13.6026 23.6185 14.0107 22.9727C14.328 22.4728 14.6648 21.9855 15.0049 21.501C16.8017 18.9409 18.7896 16.4377 21.1416 14.3633C22.4038 13.25 23.5953 12.5981 24.5303 11.9971C25.6888 11.2522 26.2872 10.4961 25.8604 9.3916Z"
                        fill="#195eff"
                      />
                      <path
                        d="M25.8604 9.3916C25.4334 8.28717 24.1545 7.72398 23.0039 8.13379C21.2395 8.76233 19.5746 9.9508 18.1348 11.2207C15.8372 13.2471 13.8578 15.6316 12.0498 18.0977C11.5472 17.5641 11.0635 17.159 10.6074 16.8525C9.8933 16.3727 9.08834 16.032 8.22168 16C6.99463 16.0002 6 16.9558 6 18.1338C6.00015 19.1998 6.81474 20.0828 7.87891 20.2412C8.0768 20.3382 8.95217 20.8594 10.1816 22.9248C10.5722 23.5809 11.295 23.9902 12.082 24C12.8689 24.0098 13.6026 23.6185 14.0107 22.9727C14.328 22.4728 14.6648 21.9855 15.0049 21.501C16.8017 18.9409 18.7896 16.4377 21.1416 14.3633C22.4038 13.25 23.5953 12.5981 24.5303 11.9971C25.6888 11.2522 26.2872 10.4961 25.8604 9.3916Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Character Name */}
              <span
                className="text-sm font-normal mt-1 text-center truncate w-full lowercase"
                style={{
                  color: "var(--color-on-surface)",
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
