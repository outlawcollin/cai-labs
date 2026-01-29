"use client";

import { useState } from "react";
import { ImageCard } from "../shared/ImageCard";
import PillTab from "../shared/PillTab";
import { categoryMeta } from "../../data";
import { GenerationBatch as GenerationBatchType, GeneratedImage, OptionCategory } from "../../types";
import ImageFullscreen from "./ImageFullscreen";

interface GenerationBatchProps {
  batch: GenerationBatchType;
  onReshoot?: () => void;
  onUseDetails?: () => void;
  isMobile?: boolean;
}

export default function GenerationBatch({
  batch,
  onReshoot,
  onUseDetails,
  isMobile = false,
}: GenerationBatchProps) {
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const { request, images } = batch;

  // Get starring info based on mode
  const getStarringInfo = () => {
    const { mode, persona, character, character2 } = request;
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

  // Get all selected options as pills with category info
  const getOptionPills = () => {
    const pills: { category: OptionCategory; label: string }[] = [];
    const categories: OptionCategory[] = [
      "style",
      "shot",
      "scene",
      "outfit",
      "pose",
      "gesture",
      "expression",
      "effects",
    ];

    categories.forEach((category) => {
      const options = request.options[category];
      if (options && options.length > 0) {
        options.forEach((option) => {
          pills.push({ category, label: option.label });
        });
      }
    });

    return pills;
  };

  const { avatars, names } = getStarringInfo();
  const optionPills = getOptionPills();
  const starringText = names.join(" & ");

  // Pad images array to always show 4 slots
  const displayImages = [...images];
  while (displayImages.length < 4) {
    displayImages.push({ id: `empty-${displayImages.length}`, url: "", thumbnail: "" });
  }

  return (
    <div className={`flex flex-col ${isMobile ? "px-4" : ""}`}>
      {/* Image Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
        {displayImages.slice(0, 4).map((image) => (
          <ImageCard
            key={image.id}
            imageUrl={image.url || undefined}
            isLoading={!image.url}
            isMobile={isMobile}
            fillContainer
            onClick={image.url ? () => setFullscreenImage(image) : undefined}
          />
        ))}
      </div>

      {/* Metadata Row */}
      <div
        className={`flex items-center w-full pb-3 ${isMobile ? "justify-between" : "gap-2"}`}
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

        {/* Detail pills - hidden on mobile */}
        {!isMobile && (
          <div className="flex flex-wrap gap-2 items-center flex-1 ml-6">
            {optionPills.map((pill, index) => (
              <PillTab
                key={`${pill.category}-${pill.label}-${index}`}
                label={pill.label}
                size="xs"
                color={categoryMeta[pill.category].pillColor}
              />
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onReshoot && (
            <button
              type="button"
              onClick={onReshoot}
              className={`flex items-center justify-center border shrink-0 transition-colors hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${
                isMobile ? "w-[38px] h-[38px] rounded-full" : "gap-2 px-4 py-2 rounded-full"
              }`}
              style={{
                borderColor: "var(--color-outline-variant)",
                color: "var(--color-on-surface)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.51 15C4.15 17.13 5.52 18.95 7.37 20.12C9.22 21.29 11.41 21.73 13.55 21.36C15.69 20.99 17.62 19.84 18.98 18.11C20.34 16.38 21.04 14.2 20.97 11.97C20.9 9.74 20.06 7.6 18.59 5.96C17.12 4.32 15.12 3.28 12.96 3.04C10.8 2.8 8.63 3.37 6.85 4.64L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {!isMobile && <span className="text-sm font-medium">Reshoot</span>}
            </button>
          )}
          {onUseDetails && (
            <button
              type="button"
              onClick={onUseDetails}
              className={`flex items-center justify-center border shrink-0 transition-colors hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer ${
                isMobile ? "w-[38px] h-[38px] rounded-full" : "gap-2 px-4 py-2 rounded-full"
              }`}
              style={{
                borderColor: "var(--color-outline-variant)",
                color: "var(--color-on-surface)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {!isMobile && <span className="text-sm font-medium">Use Details</span>}
            </button>
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreenImage && (
        <ImageFullscreen
          image={fullscreenImage}
          batch={batch}
          onClose={() => setFullscreenImage(null)}
          onReshoot={onReshoot}
          onUseDetails={onUseDetails}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
