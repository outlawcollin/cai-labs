"use client";

import type {
  ImageMode,
  Persona,
  Character,
  SelectedOptions,
  OptionCategory,
} from "../../types";
import { ImageCard } from "../shared/ImageCard";
import PillTab from "../shared/PillTab";
import { categoryMeta } from "../../data";

interface LoadingStateProps {
  mode: ImageMode;
  persona: Persona | null;
  character: Character | null;
  character2: Character | null;
  selectedOptions: SelectedOptions;
  onCancel: () => void;
  isMobile?: boolean;
}

export default function LoadingState({
  mode,
  persona,
  character,
  character2,
  selectedOptions,
  onCancel,
  isMobile = false,
}: LoadingStateProps) {
  // Build the "starring" info based on mode
  const getStarringInfo = () => {
    const avatars: { url: string; isPersona: boolean }[] = [];
    const names: string[] = [];

    if (mode === "self-portrait" && persona) {
      avatars.push({ url: persona.avatar, isPersona: true });
      names.push(persona.name);
    } else if (mode === "solo" && character) {
      avatars.push({ url: character.avatar, isPersona: false });
      names.push(character.name);
    } else if (mode === "together") {
      if (persona) {
        avatars.push({ url: persona.avatar, isPersona: true });
        names.push(persona.name);
      }
      if (character) {
        avatars.push({ url: character.avatar, isPersona: false });
        names.push(character.name);
      }
    } else if (mode === "duo") {
      if (character) {
        avatars.push({ url: character.avatar, isPersona: false });
        names.push(character.name);
      }
      if (character2) {
        avatars.push({ url: character2.avatar, isPersona: false });
        names.push(character2.name);
      }
    }

    return { avatars, names };
  };

  // Collect all selected options with their category for color lookup
  const getSelectedOptionsWithCategory = (): { label: string; category: OptionCategory }[] => {
    const items: { label: string; category: OptionCategory }[] = [];
    (Object.entries(selectedOptions) as [OptionCategory, typeof selectedOptions[OptionCategory]][]).forEach(([category, options]) => {
      options?.forEach((option) => {
        items.push({ label: option.label, category });
      });
    });
    return items;
  };

  const { avatars, names } = getStarringInfo();
  const selectedItems = getSelectedOptionsWithCategory();
  const starringText = names.join(" & ");

  return (
    <div className={`flex flex-col justify-start ${isMobile ? "px-4" : ""}`}>
      {/* Loading cards */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <ImageCard key={i} isLoading isMobile={isMobile} fillContainer />
        ))}
      </div>

      {/* Ingredients bar */}
      <div
        className="flex items-center justify-between w-full pb-3"
      >
        {/* Starring section */}
        {avatars.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Overlapping avatars */}
            <div className="flex items-center">
              {avatars.map((avatar, index) => (
                <div
                  key={`${avatar.url}-${index}`}
                  className={`w-[42px] h-[42px] overflow-hidden border-2 shrink-0 ${
                    avatar.isPersona ? "rounded-full" : "rounded-lg"
                  }`}
                  style={{
                    marginLeft: index > 0 ? "-14px" : 0,
                    borderColor: "var(--color-background)",
                    zIndex: avatars.length - index,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Text */}
            <div className="flex flex-col items-start">
              <span
                className="font-mono text-[10px] uppercase tracking-wide"
                style={{ color: "var(--color-on-surface)" }}
              >
                Starring
              </span>
              <span
                className="text-lg font-medium leading-tight"
                style={{ color: "var(--color-on-surface)" }}
              >
                {starringText}
              </span>
            </div>
          </div>
        )}


        {/* Cancel button */}
        <button
          onClick={onCancel}
          className={`flex items-center justify-center border shrink-0 transition-colors hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${
            isMobile ? "w-[38px] h-[38px] rounded-full" : "gap-2 px-4 py-2 rounded-full"
          }`}
          style={{
            borderColor: "var(--color-outline-variant)",
            color: "var(--color-on-surface)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {!isMobile && <span className="text-sm font-medium">Cancel</span>}
        </button>
      </div>
    </div>
  );
}
