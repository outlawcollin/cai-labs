"use client";

import Image from "next/image";
import { ImageCard } from "../shared/ImageCard";
import PillTab from "../shared/PillTab";
import { GenerationBatch as GenerationBatchType, OptionCategory } from "../../types";

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
  const { request, images } = batch;

  // Get starring info based on mode
  const getStarringInfo = () => {
    const { mode, persona, character, character2 } = request;
    const names: string[] = [];
    const avatars: string[] = [];

    if (mode === "self-portrait" && persona) {
      names.push(persona.name);
      avatars.push(persona.avatar);
    } else if (mode === "solo" && character) {
      names.push(character.name);
      avatars.push(character.avatar);
    } else if (mode === "together" && persona && character) {
      names.push(persona.name, character.name);
      avatars.push(persona.avatar, character.avatar);
    } else if (mode === "duo" && character && character2) {
      names.push(character.name, character2.name);
      avatars.push(character.avatar, character2.avatar);
    }

    return { names, avatars };
  };

  // Get all selected options as pills
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

  const { names, avatars } = getStarringInfo();
  const optionPills = getOptionPills();

  // Pad images array to always show 4 slots
  const displayImages = [...images];
  while (displayImages.length < 4) {
    displayImages.push({ id: `empty-${displayImages.length}`, url: "", thumbnail: "" });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Image Grid */}
      <div className={isMobile ? "flex flex-col gap-3" : "flex gap-3"}>
        {displayImages.slice(0, 4).map((image) => (
          <ImageCard
            key={image.id}
            imageUrl={image.url || undefined}
            isLoading={!image.url}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Metadata Row */}
      <div className={isMobile ? "flex flex-col gap-3" : "flex items-center justify-between"}>
        {/* Left: Starring Info */}
        <div className="flex items-center gap-2">
          {avatars.length > 0 && (
            <div className="flex items-center">
              {avatars.map((avatar, index) => (
                <div
                  key={index}
                  className="relative w-6 h-6 rounded-full overflow-hidden border-2"
                  style={{
                    marginLeft: index > 0 ? "-12px" : "0",
                    borderColor: "var(--color-background)",
                    zIndex: avatars.length - index,
                  }}
                >
                  <Image
                    src={avatar}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
              ))}
            </div>
          )}
          {names.length > 0 && (
            <span
              className="text-sm font-mono"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Starring: {names.join(" & ")}
            </span>
          )}
        </div>

        {/* Middle: Option Pills */}
        <div className={isMobile ? "flex items-center gap-1.5 flex-wrap" : "flex items-center gap-1.5 flex-wrap justify-center"}>
          {optionPills.map((pill, index) => (
            <PillTab key={`${pill.category}-${index}`} label={pill.label} size="xs" />
          ))}
        </div>

        {/* Right: Action Buttons */}
        <div className={isMobile ? "flex flex-col gap-2 w-full" : "flex items-center gap-2"}>
          {onReshoot && (
            <button
              type="button"
              onClick={onReshoot}
              className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors hover:opacity-80 ${isMobile ? "w-full" : ""}`}
              style={{
                backgroundColor: "var(--color-surface-variant)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              Reshoot
            </button>
          )}
          {onUseDetails && (
            <button
              type="button"
              onClick={onUseDetails}
              className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-colors hover:opacity-80 ${isMobile ? "w-full" : ""}`}
              style={{
                backgroundColor: "var(--color-surface-variant)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              Use Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
