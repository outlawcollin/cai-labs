"use client";

import { useEffect } from "react";
import PillTab from "../shared/PillTab";
import { categoryMeta } from "../../data";
import type {
  GenerationBatch,
  GeneratedImage,
  OptionCategory,
} from "../../types";

interface ImageFullscreenProps {
  image: GeneratedImage;
  batch: GenerationBatch;
  onClose: () => void;
  onReshoot?: () => void;
  onUseDetails?: () => void;
  isMobile?: boolean;
}

export default function ImageFullscreen({
  image,
  batch,
  onClose,
  onReshoot,
  onUseDetails,
  isMobile = false,
}: ImageFullscreenProps) {
  const { request } = batch;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

  const getOptionPills = () => {
    const pills: { category: OptionCategory; label: string }[] = [];
    const categories: OptionCategory[] = [
      "style", "shot", "scene", "outfit", "pose", "gesture", "expression", "effects",
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      {/* Image container — maintains aspect ratio, fills viewport */}
      <div
        className="relative max-w-full max-h-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: "9/16" , height: "calc(100vh - 48px)", maxHeight: "calc(100vh - 48px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The image itself */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.url}
          alt="Generated image"
          className="w-full h-full object-cover"
        />

        {/* Top bar — inside the image */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)" }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--color-inverse-surface, #f3f3f3)", color: "var(--color-inverse-on-surface, #1e1e1e)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Download + Post */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center shrink-0 cursor-pointer transition-opacity hover:opacity-80"
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                backgroundColor: "var(--color-inverse-surface, #f3f3f3)",
                color: "var(--color-inverse-on-surface, #1e1e1e)",
              }}
              aria-label="Download image"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M15.1875 11.0625V13.6875C15.1875 14.5159 14.5159 15.1875 13.6875 15.1875H4.3125C3.48407 15.1875 2.8125 14.5159 2.8125 13.6875V11.0625M8.99999 11.25V2.8125M8.99999 11.25L6.375 8.625M8.99999 11.25L11.625 8.625"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              className="flex items-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-80"
              style={{
                height: 42,
                borderRadius: 40,
                backgroundColor: "var(--color-inverse-surface, #f3f3f3)",
                color: "var(--color-inverse-on-surface, #1e1e1e)",
                padding: "0 18px",
              }}
              aria-label="Post image"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5.625 12.4375C6.13335 12.4375 6.54545 12.8572 6.54545 13.375C6.54545 13.8928 6.13335 14.3125 5.625 14.3125C5.11665 14.3125 4.70455 13.8928 4.70455 13.375C4.70455 12.8572 5.11665 12.4375 5.625 12.4375Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                <path fillRule="evenodd" clipRule="evenodd" d="M15.75 3.375C15.75 2.26217 15.0017 1.5 13.9091 1.5H4.09091C2.99831 1.5 2.25 2.26217 2.25 3.375V14.625C2.25 15.7378 2.99832 16.5 4.09091 16.5H13.9091C15.0017 16.5 15.75 15.7378 15.75 14.625V3.375ZM4.09091 15.25C3.72671 15.25 3.47727 14.9959 3.47727 14.625V3.375C3.47727 3.00406 3.72671 2.75 4.09091 2.75H13.9091C14.2733 2.75 14.5227 3.00406 14.5227 3.375V14.625C14.5227 14.9959 14.2733 15.25 13.9091 15.25H4.09091Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.77273 13.375C7.77273 13.0298 8.04746 12.75 8.38636 12.75H12.6818C13.0207 12.75 13.2955 13.0298 13.2955 13.375C13.2955 13.7202 13.0207 14 12.6818 14H8.38636C8.04746 14 7.77273 13.7202 7.77273 13.375Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm font-medium">Post</span>
            </button>
          </div>
        </div>

        {/* Bottom bar — inside the image */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)" }}
        >
          <div className={`flex items-center w-full ${isMobile ? "justify-between" : "gap-2"}`}>
            {/* Starring section */}
            {avatars.length > 0 && (
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center">
                  {avatars.map((avatar, index) => (
                    <div
                      key={`${avatar.url}-${index}`}
                      className={`w-[42px] h-[42px] overflow-hidden border-2 shrink-0 ${
                        avatar.isPersona ? "rounded-full" : "rounded-lg"
                      }`}
                      style={{
                        marginLeft: index > 0 ? "-14px" : 0,
                        borderColor: "rgba(0,0,0,0.3)",
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

                <div className="flex flex-col items-start">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-white/60">
                    Starring
                  </span>
                  <span className="text-lg font-medium leading-tight text-white">
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
                  className={`flex items-center justify-center border shrink-0 transition-opacity hover:opacity-80 cursor-pointer ${
                    isMobile ? "w-[38px] h-[38px] rounded-full" : "gap-2 px-4 py-2 rounded-full"
                  }`}
                  style={{
                    borderColor: "rgba(255,255,255,0.25)",
                    color: "#fff",
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
                  className={`flex items-center justify-center border shrink-0 transition-opacity hover:opacity-80 cursor-pointer ${
                    isMobile ? "w-[38px] h-[38px] rounded-full" : "gap-2 px-4 py-2 rounded-full"
                  }`}
                  style={{
                    borderColor: "rgba(255,255,255,0.25)",
                    color: "#fff",
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
        </div>
      </div>
    </div>
  );
}
