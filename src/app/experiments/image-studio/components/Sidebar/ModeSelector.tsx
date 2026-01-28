"use client";

import Image from "next/image";
import { ImageMode } from "../../types";

interface ModeSelectorProps {
  mode: ImageMode;
  onModeChange: (mode: ImageMode) => void;
  isMobile?: boolean;
}

interface ModeOption {
  id: ImageMode;
  label: string;
  subtitle: string;
  image: string;
}

const MODE_OPTIONS: ModeOption[] = [
  { id: "solo", label: "character", subtitle: "", image: "/image-studio/mode/solo.png" },
  { id: "self-portrait", label: "u", subtitle: "", image: "/image-studio/mode/self-portrait.png" },
  { id: "together", label: "char + u", subtitle: "", image: "/image-studio/mode/together.png" },
  { id: "duo", label: "char + char", subtitle: "", image: "/image-studio/mode/duo.png" },
];

export default function ModeSelector({ mode, onModeChange, isMobile }: ModeSelectorProps) {
  return (
    <div className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-1`}>
      {MODE_OPTIONS.map((option) => {
        const isSelected = mode === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onModeChange(option.id)}
            className="flex flex-col items-center"
          >
            {/* Image Container */}
            <div
              className="relative aspect-square w-full rounded-4xl overflow-hidden"
              style={{
                border: isSelected
                  ? "1.5px solid #195eff"
                  : "1.5px solid color-mix(in srgb, var(--color-on-brand) 8%, transparent)",
              }}
            >
              <Image
                src={option.image}
                alt={option.label}
                fill
                className="object-cover"
                sizes="100px"
              />

              {/* Selected Checkmark Badge - Top Right */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
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

            {/* Label */}
            <span
              className="text-base font-normal mt-1 text-center truncate w-full lowercase"
              style={{ color: "var(--color-on-surface)" }}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
